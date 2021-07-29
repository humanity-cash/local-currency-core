import mongoose from 'mongoose';

const ExampleSchema = new mongoose.Schema({
	firstName: String,
	age: Number,
});

export default mongoose.model('Example', ExampleSchema);