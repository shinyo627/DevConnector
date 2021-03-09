===== DevConnector =====

A network where developers can share their profiles and discuss about ideas, problems, and new technology.
Opened to public for viewing profiles of registered users including their social media details.

Live-chat funcionality implementation per groups/projects will come in soon for authorized users.

Technologies:

1) JWT, and bcryptjs for authentication/authorization/security.
2) React/Node/Express/MongoDB.
3) Redux/thunk for manging global states and data resources.
4) Font awesome, gravatar, normalize-url, and moment as additional technology for styling, fetching avatar image for profile image, stable url format, and formatting Date datas on UI.

Link ---> https://enigmatic-gorge-55171.herokuapp.com/

NOTE: Currently the deployed website has a small error found today when a signed-in user clicks edit profile button on developer page(https://enigmatic-gorge-55171.herokuapp.com/profiles ===> /profile/userId). Instead of redircting the signed-in user to the '/profileform', the website returns Page not found. This pesky bug will be fixed promtly today.

----------------------------------------------------------------------------------------------------------------------------------------------------------------------
In the project directory, you can run:

### `npm run dev`

Runs the app in the development mode.<br />
