import { config } from "dotenv";
import { connectDB } from "../lib/db.js";
import User from "../models/user.model.js";

config();

const seedUsers = [
    // Female Users
    {
      email: "aarya.sharma@example.in",
      fullName: "Aarya Sharma",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/women/9.jpg",
    },
    {
      email: "isha.verma@example.in",
      fullName: "Isha Verma",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/women/12.jpg",
    },
    {
      email: "priya.kapoor@example.in",
      fullName: "Priya Kapoor",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/women/14.jpg",
    },
    {
      email: "radhika.malhotra@example.in",
      fullName: "Radhika Malhotra",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/women/11.jpg",
    },
    {
      email: "ananya.singh@example.in",
      fullName: "Ananya Singh",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/women/10.jpg",
    },
    {
      email: "meera.jain@example.in",
      fullName: "Meera Jain",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/women/15.jpg",
    },
    {
      email: "kavya.iyer@example.in",
      fullName: "Kavya Iyer",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/women/13.jpg",
    },
    {
      email: "tanvi.rastogi@example.in",
      fullName: "Tanvi Rastogi",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/women/16.jpg",
    },
  
    // Male Users
    {
      email: "arjun.mehra@example.in",
      fullName: "Arjun Mehra",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/9.jpg",
    },
    {
      email: "rohan.agarwal@example.in",
      fullName: "Rohan Agarwal",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/11.jpg",
    },
    {
      email: "veer.chaudhary@example.in",
      fullName: "Veer Chaudhary",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/12.jpg",
    },
    {
      email: "dev.patel@example.in",
      fullName: "Dev Patel",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/10.jpg",
    },
    {
      email: "krishna.nair@example.in",
      fullName: "Krishna Nair",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/13.jpg",
    },
    {
      email: "advait.kulkarni@example.in",
      fullName: "Advait Kulkarni",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/14.jpg",
    },
    {
      email: "siddharth.sen@example.in",
      fullName: "Siddharth Sen",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/15.jpg",
    },
  ];
  
  

const seedDatabase = async () => {
  try {
    await connectDB();

    await User.insertMany(seedUsers);
    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

// Call the function
seedDatabase();