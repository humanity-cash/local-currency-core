module.exports = {
	coveragePathIgnorePatterns: ["/node_modules/"],
	transform: {
		"node_modules/variables/.+\\.(j|t)sx?$": "ts-jest",
	},
	transformIgnorePatterns: ["node_modules/(?!variables/.*)"],
	collectCoverageFrom: ["src/**/*.ts", "src/**/**/*.ts"],
	preset: "ts-jest",
	roots: ["<rootDir>/src/", "<rootDir>/test/"],
	moduleNameMapper: {
		"^src/(.*)$": "<rootDir>/src/$1",
	},
	testEnvironment: "node",
	globals: {
		"ts-jest": {
			diagnostics: true,
		},
	},
	testTimeout: 30000
};
