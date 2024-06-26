import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Register from "./pages/Register/Register";
import RegisterCompany from "./pages/RegisterCompany/RegisterCompany";
import HomePage from "./pages/HomePage/HomePage";
import CompanyDashboard from "./pages/CompanyDashboard/CompanyDashboard";
import ProductPage from "./pages/ProductPage/ProductPage";
import UserDashboard from "./pages/UserDashboard/UserDashboard";
import ProductVerifyPage from "./pages/ProductVerifyPage/ProductVerifyPage";
import BuyPage from "./pages/BuyPage/BuyPage";
import Admin from "./pages/Admin/Admin";
import AnonLogin from "./pages/AnonLogin/AnonLogin";
import styled from "styled-components";

const App = () => {
	const router = createBrowserRouter([
		{
			path: "/",
			element: (
				<>
					<HomePage />
				</>
			),
		},
		{
			path: "/register",
			element: (
				<>
					<Navbar />
					<Register />
				</>
			),
		},
		{
			path: "/registerCompany",
			element: (
				<>
					<Navbar />
					<RegisterCompany />
				</>
			),
		},
		{
			path: "/companyDashboard",
			element: (
				<>
					<Navbar />
					<CompanyDashboard />
				</>
			),
		},
		{
			path: "/userDashboard",
			element: (
				<>
					<Navbar />
					<UserDashboard />
				</>
			),
		},
		{
			path: "/product/:id",
			element: (
				<>
					<Navbar />
					<ProductPage />
				</>
			),
		},
		{
			path: "/verify/:addr/:id",
			element: (
				<>
					<Navbar />
					<ProductVerifyPage />
				</>
			),
		},
		{
			path: "anonVerify",
			element: (
				<FullHeightPage>
					<Navbar />
					<AnonLogin />
				</FullHeightPage>
			),
		},
		{
			path: "/buy/:addr/:id",
			element: (
				<>
					<Navbar />
					<BuyPage />
				</>
			),
		},
		{
			path: "/admin",
			element: (
				<>
					<Navbar />
					<Admin />
				</>
			),
		},
	]);

	return (
		<>
			<RouterProvider router={router}></RouterProvider>
		</>
	);
};

const FullHeightPage = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100vh;
`;

export default App;
