import jwt_decode from "jwt-decode";
import { ACCESS_TOKEN } from "./constants";

const token = localStorage.getItem(ACCESS_TOKEN);

if (token) {
  const decoded = jwt_decode(token);
  console.log("Decoded Token:", decoded);

  if (decoded.exp) {
    const expiryDate = new Date(decoded.exp * 1000);
    console.log("Access Token Expiry Time:", expiryDate);
  } else {
    console.log("No expiry information found in token.");
  }
} else {
  console.log("No Access Token found.");
}