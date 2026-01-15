import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import unusedImports from "eslint-plugin-unused-imports";
import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
	...nextVitals,
	...nextTs,
	// Override default ignores of eslint-config-next.
	globalIgnores([
		// Default ignores of eslint-config-next:
		".next/**",
		"out/**",
		"build/**",
		"next-env.d.ts"
	]),
	// Add unused-imports plugin
	{
		plugins: {
			"unused-imports": unusedImports
		},
		rules: {
			"@typescript-eslint/no-unused-vars": "off",
			"@typescript-eslint/no-unused-expressions": "off",
			"@typescript-eslint/no-namespace": "off",
			"@typescript-eslint/no-empty-object-type": "off",
			"react/react-in-jsx-scope": 0,
			"react-hooks/rules-of-hooks": "error",
			"no-console": 0,
			"react/state-in-constructor": 0,
			"@typescript-eslint/no-explicit-any": 0,
			indent: 0,
			"linebreak-style": 0,
			"react/prop-types": 0,
			"jsx-a11y/click-events-have-key-events": 0,
			"@typescript-eslint/ban-ts-comment": 0,
			"@typescript-eslint/no-non-null-asserted-optional-chain": 0,
			"unused-imports/no-unused-imports": "warn",
			"unused-imports/no-unused-vars": [
				"off",
				{
					vars: "all",
					varsIgnorePattern: "^_",
					args: "after-used",
					argsIgnorePattern: "^_"
				}
			]
			// Only applicable for nextjs-toploader
			// Remove this if you are not using nextjs-toploader
			// "no-restricted-imports": [
			// 	"error",
			// 	{
			// 		name: "next/navigation",
			// 		importNames: ["useRouter"],
			// 		message: "Please import from `nextjs-toploader/app` instead."
			// 	}
			// ],
			// Only applicable for next-intl
			// Remove this if you are not using next-intl
			// "no-restricted-imports": [
			// 	"error",
			// 	{
			// 		name: "next/link",
			// 		message: "Please import from `@/i18n/routing` instead."
			// 	},
			// 	{
			// 		name: "next/navigation",
			// 		importNames: ["redirect", "permanentRedirect", "useRouter", "usePathname"],
			// 		message: "Please import from `@/i18n/routing` instead."
			// 	}
			// ]
		}
	}
]);

export default eslintConfig;
