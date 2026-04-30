import React from "react";
import Wrapper from "./style";
import Lottie from "lottie-react";
import Loader from "../../../assets/Loading.json";
import XediLoader from "../../XediLoader";

const Loading = () => {
    return (
        <Wrapper>
            <div className="loading-overlay">
                <div className="loading-container">
                    <XediLoader />
                </div>
            </div>
        </Wrapper>
    );
};

export default Loading;
