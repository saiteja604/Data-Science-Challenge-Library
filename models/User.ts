import mongoose from 'mongoose';

// Define the TypeScript interface
interface IUser {
    username: string;
    password: string;
    // include other fields as needed
}

// Create a Schema corresponding to the interface
const userSchema = new mongoose.Schema<IUser>({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // other fields as needed
});

// Create a Model

const User = mongoose.model('User', userSchema);

export default User;
