/*!

=========================================================
* Argon Dashboard React - v1.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import Index from "./views/Index.js";
import Profile from "./views/examples/Profile.js";
// import Maps from "./views/examples/Maps.js";
import Register from "./views/examples/Register.js";
import Login from "./views/examples/Login.js";
// import Tables from "./views/examples/Tables.js";
// import Icons from "./views/examples/Icons.js";
import Icons from './views/examples/Icons.js'
import Dashboard from "./views/Dashboard/Dashboard.js";
import Admin from "./views/examples/admin.js"
import ContractHistory from "./views/examples/ContractHistory.js";
import CarbonAccounting from "./views/examples/CarbonAccounting.js"; // Import the new component


var routes = [
  {
    path: "/index",
    name: "Dashboard",
    icon: "ni ni-tv-2 text-primary",
    component: Index,
    layout: "/admin"
  },
  {
    path: "/admin",
    name: "Admin",
    icon: "ni ni-tv-2 text-primary",
    component: Admin,
    layout: "/admin"
  },
  {
    path: "/contract-history",
    name: "Query the Ledger", //previously called contract history
    icon: "ni ni-single-02 text-blue",
    component: ContractHistory,
    layout: "/admin"
  },
  
  {
    // New route for the carbon accounting part
    path: "/Carbon-accounting",
    name: "Carbon Accounting",
    icon: "ni ni-single-02 text-blue", // A new icon to represent the calculation
    component: CarbonAccounting, // Use the new component
    layout: "/admin"
  },

  {
    path: "/user-profile",
    name: "User Profile",
    icon: "ni ni-single-02 text-blue",
    component: Profile,
    layout: "/admin"
  },
  {
    path: "/login",
    name: "Login",
    icon: "ni ni-key-25 text-info",
    component: Login,
    layout: "/auth"
  },
  {
    path: "/register",
    name: "Register",
    icon: "ni ni-circle-08 text-pink",
    component: Register,
    layout: "/auth"
  }
];
export default routes;
