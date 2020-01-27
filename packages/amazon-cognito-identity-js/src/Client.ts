import UserAgent from './UserAgent';
import CognitoUserSession from './CognitoUserSession';

type ChallengeName =
	| 'CUSTOM_CHALLENGE'
	| 'PASSWORD_VERIFIER'
	| 'SMS_MFA'
	| 'DEVICE_SRP_AUTH'
	| 'DEVICE_PASSWORD_VERIFIER'
	| 'ADMIN_NO_SRP_AUTH';

type InitiateAuthRequest = {
	params: {};
	response: {
		ChallengeName: ChallengeName;
		ChallengeParameters: {
			USER_ID_FOR_SRP: string;
			SRP_B: string;
			SALT: string;
			SECRET_BLOCK: string;
			USERNAME: string;
		};
	};
};

type SignUpRequest = {
	response: {
		UserConfirmed: boolean;
		UserSub: string;
		CodeDeliveryDetails: any;
	};
};

type VerifySoftwareTokenRequest = {
	response: {
		Session: CognitoUserSession;
	};
};

type RespondToAuthChallengeRequest = {};

type AssociateSoftwareTokenRequest = {};

type RequestMap = {
	InitiateAuth: InitiateAuthRequest;
	SignUp: SignUpRequest;
	VerifySoftwareToken: VerifySoftwareTokenRequest;
	RespondToAuthChallenge: RespondToAuthChallengeRequest;
	AssociateSoftwareToken: AssociateSoftwareTokenRequest;
	GlobalSignOut: {};
};

type RequestOperations =
	| InitiateAuthRequest
	| SignUpRequest
	| VerifySoftwareTokenRequest
	| RespondToAuthChallengeRequest
	| AssociateSoftwareTokenRequest;

/** @class */
export default class Client {
	protected readonly endpoint: string;
	protected readonly userAgent: string;

	/**
	 * Constructs a new AWS Cognito Identity Provider client object
	 * @param {string} region AWS region
	 * @param {string} endpoint endpoint
	 */
	constructor(region, endpoint) {
		this.endpoint = endpoint || `https://cognito-idp.${region}.amazonaws.com/`;
		this.userAgent = UserAgent.prototype.userAgent || 'aws-amplify/0.1.x js';
	}

	/**
	 * Makes an unauthenticated request on AWS Cognito Identity Provider API
	 * using fetch
	 * @param {string} operation API operation
	 * @param {object} params Input parameters
	 * @param {function} callback Callback called when a response is returned
	 * @returns {void}
	 */
	request(
		operation: keyof RequestMap,
		params: {},
		callback: (
			error: null | Error,
			data?: RequestOperations['response']
		) => void
	): void {
		const headers = {
			'Content-Type': 'application/x-amz-json-1.1',
			'X-Amz-Target': `AWSCognitoIdentityProviderService.${operation}`,
			'X-Amz-User-Agent': this.userAgent,
		};

		const options: RequestInit = {
			headers,
			method: 'POST',
			mode: 'cors',
			cache: 'no-cache',
			body: JSON.stringify(params),
		};

		let response;
		let responseJsonData;

		fetch(this.endpoint, options)
			.then(
				resp => {
					response = resp;
					return resp;
				},
				err => {
					// If error happens here, the request failed
					// if it is TypeError throw network error
					if (err instanceof TypeError) {
						throw new Error('Network error');
					}
					throw err;
				}
			)
			.then(resp => resp.json().catch(() => ({})))
			.then(data => {
				// return parsed body stream
				if (response.ok) return callback(null, data);
				responseJsonData = data;

				// Taken from aws-sdk-js/lib/protocol/json.js
				// eslint-disable-next-line no-underscore-dangle
				const code = (data.__type || data.code).split('#').pop();
				const error = {
					code,
					name: code,
					message: data.message || data.Message || null,
				};
				return callback(error);
			})
			.catch(err => {
				// first check if we have a service error
				if (
					response &&
					response.headers &&
					response.headers.get('x-amzn-errortype')
				) {
					try {
						const code = response.headers.get('x-amzn-errortype').split(':')[0];
						const error = {
							code,
							name: code,
							statusCode: response.status,
							message: response.status ? response.status.toString() : null,
						};
						return callback(error);
					} catch (ex) {
						return callback(err);
					}
					// otherwise check if error is Network error
				} else if (err instanceof Error && err.message === 'Network error') {
					const error = {
						code: 'NetworkError',
						name: err.name,
						message: err.message,
					};
					return callback(error);
				} else {
					return callback(err);
				}
			});
	}
}
