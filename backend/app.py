from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from urllib.parse import urlparse
import whois
import socket
import ssl
import requests
import dns.resolver
from datetime import datetime
COMMON_PORTS = {
    80: "HTTP",
    443: "HTTPS",
    22: "SSH",
    21: "FTP",
    3306: "MySQL",
    5432: "PostgreSQL",
    8080: "HTTP-Alt",
}


app = Flask(__name__)
CORS(app)

VT_API_KEY = None

def extract_domain(url:str)-> str:
    try:
        parsed = urlparse(url if url.startswith("http") else "http://" + url)
        domain = parsed.netloc.lower()
        if ":" in domain:
            domain = domain.split(":")[0]
        return domain
    except:
        return ""

def get_domain_age(domain):
    try:
        info=whois.whois(domain)
        creation_date=info.creation_date
        if isinstance(creation_date,list):
            creation_date=min(creation_date)
        
        if creation_date is None:
            return 0
        
        if isinstance(creation_date, str):
            for fmt in ("%Y-%m-%d", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M:%S%z"):
                try:
                    creation_date = datetime.strptime(creation_date, fmt)
                    break
                except:
                    continue
            else:
                return 0
            
        if hasattr(creation_date, "tzinfo") and creation_date.tzinfo is not None:
            creation_date = creation_date.replace(tzinfo=None)

        return (datetime.now()-creation_date).days
    
    except Exception:
        return 0

# Checks the website's SSL/TLS certificate by connecting to port 443.
# Returns whether HTTPS is supported, if the certificate is valid,
# how many days until expiry, and any errors during the handshake.

def check_ssl_certificate(domain: str) -> dict:
    """
    Try to connect to domain:443 with TLS, read the certificate,
    and return whether it's valid + days until expiry.
    """
    result = {
        "has_https": False,
        "is_valid": False,
        "days_to_expiry": None,
        "not_after": None,
        "error": None,
    }

    try:
        context = ssl.create_default_context()
        with socket.create_connection((domain, 443), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()

        result["has_https"] = True
        not_after_str = cert.get("notAfter")
        if not_after_str:
            not_after = datetime.strptime(not_after_str, "%b %d %H:%M:%S %Y %Z")
            result["not_after"] = not_after.isoformat()

            delta = not_after - datetime.utcnow()
            result["days_to_expiry"] = delta.days

            if delta.days >= 0:
                result["is_valid"] = True
        else:
            result["error"] = "Certificate has no notAfter field."
    except Exception as e:
        result["error"] = str(e)

    return result

# Scans a small list of common ports on the server (80, 443, 22, etc.)
# Identifies which ports are open to detect exposed services or weak configurations.
def scan_common_ports(domain: str) -> dict:
    """
    Check a small list of common ports and return which ones are open.
    """
    open_ports = []

    for port, service in COMMON_PORTS.items():
        try:
            with socket.create_connection((domain, port), timeout=1):
                open_ports.append({"port": port, "service": service})
        except Exception:
            continue

    return {"open_ports": open_ports}


def check_blacklist(domain):
    try:
        query=f"{domain}.dbl.spamhaus.org"
        dns.resolver.resolve(query,"A")
        return True
    except dns.resolver.NXDOMAIN:
        return False
    except Exception:
        return False

@app.route("/check_reputation",methods=["POST"])
def check_reputation():
    data=request.get_json()
    url=data.get("url")
    domain=extract_domain(url)
    if not domain:
        return jsonify({"error":"Missing Domain"}),400
    result={}
    score=0

    age_days=get_domain_age(domain)
    result["domain_age_days"]=age_days
    if age_days>180:
        score+=25
    elif age_days>30:
        score+=10
    
    ssl_info = check_ssl_certificate(domain)
    result["ssl"] = ssl_info
    if ssl_info["is_valid"]:
        score += 25
    elif ssl_info["has_https"]:
        score += 10

    ports_info = scan_common_ports(domain)
    result["open_ports"] = ports_info["open_ports"]

    result["score"] = score
    
    return jsonify(result)

@app.route('/',methods=['GET','OPTIONS'])
def home():
    return jsonify({"message":"app running"}),200

if __name__ == "__main__":
    app.run(debug=True)