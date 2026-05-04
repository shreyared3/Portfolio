import { FaGithub, FaLinkedin } from "react-icons/fa";

const HeaderWidget = () => {
  return (
    <div
      className="absolute top-4 right-4 z-20 flex gap-4 p-3 rounded-2xl"
      style={{
        background: "rgba(255,255,255,0.1)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.2)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
      }}
    >
      <a
        href="https://github.com/shreyared3"
        target="_blank"
        rel="noreferrer"
      >
        <FaGithub
          className="text-2xl transition-colors duration-200"
          style={{ color: "#000000" }}
          onMouseEnter={(e) => ((e.target as SVGElement).style.color = "#6d28d9")}
          onMouseLeave={(e) => ((e.target as SVGElement).style.color = "#000000")}
        />
      </a>
      <a
        href="https://www.linkedin.com/in/shreyar3"
        target="_blank"
        rel="noreferrer"
      >
        <FaLinkedin
          className="text-2xl transition-colors duration-200"
          style={{ color: "#000000" }}
          onMouseEnter={(e) => ((e.target as SVGElement).style.color = "#2563eb")}
          onMouseLeave={(e) => ((e.target as SVGElement).style.color = "#000000")}
        />
      </a>
    </div>
  );
};

export default HeaderWidget;
