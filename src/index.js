import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

import { AuthContextProvider } from "./Context/AuthContext";
import { SafeBuyProvider } from "./Context/SafeBuyContext";
import "react-toastify/dist/ReactToastify.css";
import { AnonAadhaarProvider } from "@anon-aadhaar/react";


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<React.StrictMode>
		<AuthContextProvider>
			<AnonAadhaarProvider>
				<SafeBuyProvider>
					<App />
				</SafeBuyProvider>
			</AnonAadhaarProvider>
		</AuthContextProvider>
	</React.StrictMode>
);
