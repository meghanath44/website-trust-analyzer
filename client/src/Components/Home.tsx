import React,{ useState } from "react";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";

function Home (){

    Modal.setAppElement("#root");
    const navigate = useNavigate();
    const [url, setUrl] = useState("");
    const [isInvalidUrl, setIsInvalidUrl] = useState(false);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [data, setData] = useState<any>(null);
    const onSubmit = async (e:React.FormEvent) =>{
        e.preventDefault();
        setLoading(true);
        try{
            new URL(url);
            const response = await fetch('http://127.0.0.1:5000/check_reputation',{
                mode:'cors',
                method:'POST',
                headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'},
                body:JSON.stringify({'url':url}),
            });
            const data= await response.json();
            console.log(data);
            setData(data);
            setLoading(false);
            setModalOpen(true);
        }
        catch(e){
            setLoading(false);
            setIsInvalidUrl(true);
        }
        
    }

    const onURLChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        setIsInvalidUrl(false);
        setUrl(e.currentTarget.value);
    }


    return (
        <div>
            {!loading && (<>
                <h1>Website Genuineness Validator</h1>
                <form onSubmit={onSubmit}>
                    <input
                        type="text"
                        placeholder="Enter website URL"
                        value={url}
                        onChange={(e)=>onURLChange(e)}>
                    </input>
                    <button type="submit">Check</button>
                </form>
                {isInvalidUrl && (<div>Invalid URL Entered!</div>)}
            </>)}
            {loading && (<div >
                <div className="spinner"></div>
                <p>Analyzing website...</p>
            </div>)}

            <Modal
                isOpen={modalOpen}
                onRequestClose={() => setModalOpen(false)}
                style={{
                  content: {
                    width: "50%",
                    margin: "auto",
                    padding: "25px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  },
                }}
            >
            <h3 style={{ textAlign: "center" }}>Website Severity Score</h3>
            <h2 style={{ textAlign: "center" }}>{url}</h2>

            {data ? (
              <div style={{ marginTop: "15px" }}>
                <h3
                  style={{
                    textAlign: "center",
                    fontSize: "28px",
                    color: data.score_severity??"red",
                  }}
                >
                  {data.score} / 100
                </h3>

                <hr />

                <p style={{color:data.domain_age_days_severity??"red"}}><strong>Domain Age:</strong> {data.domain_age_days} days</p>
                <p style={{color:data.ssl_severity??"red"}}><strong>SSL Valid:</strong> {data.ssl?.is_valid ? "Yes" : "No"}</p>
                <p style={{color:data.blacklisted_severity??"red"}}><strong>Blacklisted:</strong> {data.blacklisted ? "Yes" : "No"}</p>

                <p style={{color:data.malicious_severity??"red"}}>
                  <strong>VirusTotal Malicious Count:</strong>{" "}
                  {data.virus_total?.malicious}
                </p>

                <p style={{color:data.open_ports_severity??"red"}}>
                  <strong>Risky Open Ports:</strong>{" "}
                  {data.open_ports?.length}
                </p>
              </div>
            ) : (
              <p>No data available</p>
            )}

            <button
              onClick={() => setModalOpen(false)}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "20px",
                fontSize: "16px",
                backgroundColor: "#333",
                color: "white",
                borderRadius: "5px",
              }}
            >
              Close
            </button>
            </Modal>
        </div>
    );
}

export default Home;