import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home (){

    const navigate = useNavigate();
    const [url, setUrl] = useState("");
    const [isInvalidUrl, setIsInvalidUrl] = useState(false);
    const [loading, setLoading] = useState(false);
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
            navigate("/result");
        }
        catch(e){
            setIsInvalidUrl(true);
        }
        setLoading(false);
    }

    const onURLChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        setIsInvalidUrl(false);
        setUrl(e.currentTarget.value)
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
        </div>
    );
}

export default Home;