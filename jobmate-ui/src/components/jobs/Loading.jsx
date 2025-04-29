import { FiLoader } from "react-icons/fi";
import "./Loading.css";

const Loading = ({ text = "Loading...", size = "medium" }) => {
  const sizeClass = {
    small: "loading-small",
    medium: "loading-medium",
    large: "loading-large",
  }[size];

  return (
    <div className="loading-container">
      <FiLoader className={`spinner ${sizeClass}`} />
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default Loading;
