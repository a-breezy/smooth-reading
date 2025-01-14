const { User } = require("../models");
const { AuthenticaitonError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const resolvers = {
	Query: {
		me: async (parent, args, context) => {
			if (context.user) {
				const userData = await User.findOne({ _id: context.user._id }).populate(
					"savedbooks"
				);
				return userData;
			}
			throw new AuthenticaitonError("Not Logged In");
		},
	},
	Mutation: {
		addUser: async (parent, args) => {
			const user = await User.create(args);
			const token = signToken(User);
			return { token, user };
		},
		login: async (parent, { email, password }) => {
			const user = await User.findOne({ email });

			if (!user) {
				throw new AuthenticaitonError("Incorrect Credentials");
			}

			const correctPw = await user.isCorrectPassword(password);
            if(!correctPw) {
                throw new AuthenticaitonError("Incorrect Credentials");
            }

            const token = signToken(user);
            return {token, user};
		},
        saveBook: async (parent, args, context) => {
            if(context.user) {
                const updateUser = await User.findOneAndUpdate(
                    {_id: context.user._id},
                    {$push: {savedBooks: args}},
                    {new: true, runValidators: true}
                );
                return updateUser;
            }
            throw new AuthenticaitonError("You need to be logged in!")
        },
        removeBook: async (parent, {bookId}, context) => {
            if(context.user) {
                const updateUser = await User.findOneAndUpdate(
                    {_id: context.user._id},
                    {$pull: {savedBooks: {bookId: bookId}}},
                    {new: true}
                );
                return updateUser;
            }
            throw new AuthenticaitonError("You need to be logged in!")
        }
	},
};

module.exports = resolvers;
