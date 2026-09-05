const validator=require('validator');

const validate=(data)=>{

const mandatoryField=['firstName','emailId','password'];

const IsAllowed=mandatoryField.every((k)=>
Object.keys(data).includes(k)
);

if(!IsAllowed)
throw new Error("Some Field Missing");

if(!validator.isEmail(data.emailId))
throw new Error("Invalid Email");

if(!validator.isStrongPassword(data.password))
throw new Error("Weak Password");

}

module.exports=validate;

//Object.keys(data)-- This converts object keys into array.---["firstName","emailId","password"]

//Object.keys(data)

// Output:

// ["firstName","emailId","password"]

// Now this becomes:

// ["firstName","emailId","password"].includes(k)
// Suppose
// k = "emailId"

// Now:

// ["firstName","emailId","password"].includes("emailId")

// Checks:

// Is "emailId" inside array?

// YES ✅