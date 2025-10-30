import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home (){

    const navigate = useNavigate();
    const [url, setUrl] = useState("");
    const [isInvalidUrl, setIsInvalidUrl] = useState(false);
    const validateSubmit = (e:React.FormEvent) =>{
        e.preventDefault();
        try{
            new URL(url);
            navigate("/result");
        }
        catch(e){
            setIsInvalidUrl(true);
        }
    }

    const onURLChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        setIsInvalidUrl(false);
        setUrl(e.currentTarget.value)
    }


    return (
        <div>
            <h1>Website Genuineness Validator</h1>
            <form onSubmit={validateSubmit}>
                <input
                    type="text"
                    placeholder="Enter website URL"
                    value={url}
                    onChange={(e)=>onURLChange(e)}>
                </input>
                <button type="submit">Check</button>
            </form>
            {isInvalidUrl && (<div>Invalid URL Entered!</div>)}
        </div>
    );
}

export default Home;