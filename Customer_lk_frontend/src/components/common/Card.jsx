import React from "react"
import {useState} from 'react';
import painting from "./assets/paint1.jpeg";
import '../../styles/common_styles/Card.css';
function Card(){
    const item={
        pic:painting,
        name:"Birla-Opus Exterior Paint",
        rem:5,
        size:6,
        owner:"Birla Opus",
        price:1299
    }
    const [quantity,setquantity]=useState(1);
    return(
        <>
        <div className="description">
         <div className="image">
            <img src={item.pic} alt="paint.png"/>
         </div>
         <div className="description">
            <h2>{item.name}</h2>
            <h4>Only {item.rem} left in stock</h4>
            <h3>Sold by {item.owner}</h3>
            <div className="options">
                <div className="buttonss">
                    <button>Delete</button>
                    <h3>{quantity}</h3>
                    <button onClick={()=>setquantity(quantity+1)}>+</button>
                </div>
               <hr/>
                <button>Save for later</button>
                <hr/>
                <button>See more like this</button>
                <hr/>
                <button>Share</button>
            </div>
            <div>
                <h3>{price}</h3>
            </div>
         </div>
        </div>
        </>
    )
}
export default Card;