const users = require("../Seed-Data/users.json");
// import { doCreateUserWithEmailAndPassword } from '../firebase/FirebaseFunctions';
const Firebase = require('../src/firebase/FirebaseFunctions');
/**
 * @author Lun-Wei Chang
 * @version 1.0
 * @date 05/17/2020
 */
(async () => {
    try {
        for (index in users) {
            let user = users[index];
            let defaultPass = "12345678";
            console.log(`user = ${JSON.stringify(user)}`);
            await Firebase.doCreateUserWithEmailAndPassword(
                user.userEmail,
                defaultPass,   //default password
                user.userName
            );
        }
    } catch (error) {
        console.log(error.message);
    }
})();