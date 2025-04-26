import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const OauthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const userId = params.get("userId");

    if (token && userId) {
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      navigate("/dashboard");
    } else {
      navigate("/error", {
        state: {
          status: "401",
          message: "Google OAuth Failed",
          details: "Missing token or userId",
        },
      });
    }
  }, [navigate, location]);

  return <div>Signing in with Google...</div>;
};

export default OauthSuccess;
