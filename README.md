# Website Security & Reputation Checker

A full-stack application built with **React + TypeScript + Vite** on the frontend and **Flask** on the backend. This project allows users to check the security and reputation of a website by analyzing its domain age, SSL/TLS certificate, open ports, blacklisting status, and VirusTotal reputation.

---

## Features

* **Domain Analysis**: Extracts domain from a given URL and calculates its age.
* **SSL/TLS Check**: Verifies HTTPS support, certificate validity, and days until expiry.
* **Port Scanning**: Checks common risky ports (e.g., SSH, FTP, Telnet) for exposure.
* **Blacklist Check**: Identifies if a domain is listed in public blacklists.
* **VirusTotal Reputation**: Uses the VirusTotal API to check if a domain is flagged as malicious.
* **Security Score**: Computes a security score based on the above metrics.

---

## Tech Stack

### Frontend

* **React** with **TypeScript**
* **Vite** for fast development and HMR
* ESLint for linting with options for type-aware rules and React-specific rules.

#### Recommended ESLint Setup for Production

```ts
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      // React-specific lint rules
      reactX.configs['recommended-typescript'],
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
```

---

### Backend

* **Flask** with **Flask-CORS**
* **Python Libraries**:

  * `python-whois` for domain information
  * `dnspython` for DNS lookups
  * `requests` for API calls (VirusTotal)
  * `python-dotenv` for environment variable management
  * `ssl`, `socket` for SSL/TLS checks
* **Environment Variable**:

  * `VT_API_KEY` – VirusTotal API key for reputation checking

---

## Installation

### Backend

1. Clone the repository:

```bash
git clone <repo-url>
cd <repo-folder>/backend
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Add your VirusTotal API key in a `.env` file:

```
VT_API_KEY=your_api_key_here
```

4. Run the Flask server:

```bash
python app.py
```

### Frontend

1. Navigate to the frontend folder:

```bash
cd ../frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

---

## API Endpoints

* `POST /check_reputation`

  * Request body: `{ "url": "https://example.com" }`
  * Response: JSON object containing:

    * `domain_age_days`
    * `ssl` (certificate info)
    * `blacklisted` (boolean)
    * `virus_total` (reputation & malicious count)
    * `open_ports` (list of open risky ports)
    * `score` (security score out of 100)
    * Severity indicators (`green`, `yellow`)

* `GET /`

  * Returns a simple status message: `{ "message": "app running" }`

---

## Security Scoring

| Metric                   | Score Contribution | Severity |
| ------------------------ | ------------------ | -------- |
| Domain Age > 180 days    | 20                 | Green    |
| Domain Age > 30 days     | 10                 | Yellow   |
| Valid SSL certificate    | 20                 | Green    |
| SSL available, not valid | 10                 | Yellow   |
| Not Blacklisted          | 20                 | Green    |
| VirusTotal Malicious = 0 | 20                 | Green    |
| VirusTotal Malicious < 3 | 10                 | Yellow   |
| No Open Ports            | 20                 | Green    |
| ≤ 2 Open Ports           | 10                 | Yellow   |

---

## Dependencies

* **Python**: 3.10+
* **Frontend**: React 18+, TypeScript, Vite
* **Python Packages**:

```
blinker==1.9.0
certifi==2025.10.5
charset-normalizer==3.4.4
click==8.3.0
colorama==0.4.6
dnspython==2.8.0
Flask==3.1.2
flask-cors==6.0.1
idna==3.11
itsdangerous==2.2.0
Jinja2==3.1.6
MarkupSafe==3.0.3
python-dateutil==2.9.0.post0
python-dotenv==1.2.1
python-whois==0.9.6
requests==2.32.5
six==1.17.0
urllib3==2.5.0
Werkzeug==3.1.3
```

---

## License

This project is licensed under the MIT License.

---

## Author

Keerthana M.
