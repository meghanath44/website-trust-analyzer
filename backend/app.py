from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from urllib.parse import urlparse
import whois
import socket
import ssl
import requests
import dns.resolver
from datetime import datetime

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
    
    return jsonify(result)

@app.route('/',methods=['GET','OPTIONS'])
def home():
    return jsonify({"message":"app running"}),200

if __name__ == "__main__":
    app.run(debug=True)