/*!
 * Copyright 2016 Amazon.com,
 * Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Amazon Software License (the "License").
 * You may not use this file except in compliance with the
 * License. A copy of the License is located at
 *
 *     http://aws.amazon.com/asl/
 *
 * or in the "license" file accompanying this file. This file is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, express or implied. See the License
 * for the specific language governing permissions and
 * limitations under the License.
 */

import CognitoIdToken from './CognitoIdToken';
import CognitoRefreshToken from './CognitoRefreshToken';
import CognitoAccessToken from './CognitoAccessToken';

type CognitoUserSessionParams = {
	IdToken?: CognitoIdToken;
	RefreshToken?: CognitoRefreshToken;
	AccessToken?: CognitoAccessToken;
	ClockDrift?: number;
};

/** @class */
export default class CognitoUserSession {
	public readonly idToken: CognitoIdToken;
	public readonly refreshToken: CognitoRefreshToken;
	public readonly accessToken: CognitoAccessToken;
	public readonly clockDrift: number;

	/**
	 * Constructs a new CognitoUserSession object
	 * @param {CognitoIdToken} IdToken The session's Id token.
	 * @param {CognitoRefreshToken=} RefreshToken The session's refresh token.
	 * @param {CognitoAccessToken} AccessToken The session's access token.
	 * @param {int} ClockDrift The saved computer's clock drift or undefined to force calculation.
	 */
	constructor({
		IdToken,
		RefreshToken,
		AccessToken,
		ClockDrift,
	}: CognitoUserSessionParams = {}) {
		if (AccessToken == null || IdToken == null) {
			throw new Error('Id token and Access Token must be present.');
		}

		this.idToken = IdToken;
		this.refreshToken = RefreshToken;
		this.accessToken = AccessToken;
		this.clockDrift =
			ClockDrift === undefined ? this.calculateClockDrift() : ClockDrift;
	}

	/**
	 * @returns {CognitoIdToken} the session's Id token
	 */
	getIdToken(): CognitoIdToken {
		return this.idToken;
	}

	/**
	 * @returns {CognitoRefreshToken} the session's refresh token
	 */
	getRefreshToken(): CognitoRefreshToken {
		return this.refreshToken;
	}

	/**
	 * @returns {CognitoAccessToken} the session's access token
	 */
	getAccessToken(): CognitoAccessToken {
		return this.accessToken;
	}

	/**
	 * @returns {int} the session's clock drift
	 */
	getClockDrift(): number {
		return this.clockDrift;
	}

	/**
	 * @returns {int} the computer's clock drift
	 */
	calculateClockDrift(): number {
		const now = Math.floor(new Date().valueOf() / 1000);
		const iat = Math.min(
			this.accessToken.getIssuedAt(),
			this.idToken.getIssuedAt()
		);

		return now - iat;
	}

	/**
	 * Checks to see if the session is still valid based on session expiry information found
	 * in tokens and the current time (adjusted with clock drift)
	 * @returns {boolean} if the session is still valid
	 */
	isValid(): boolean {
		const now = Math.floor(new Date().valueOf() / 1000);
		const adjusted = now - this.clockDrift;

		return (
			adjusted < this.accessToken.getExpiration() &&
			adjusted < this.idToken.getExpiration()
		);
	}
}
