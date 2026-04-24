import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ExistIoApi implements ICredentialType {
	name = 'existIoApi';

	displayName = 'Exist.io API';

	icon: Icon = 'file:../icons/existio.svg';

	documentationUrl = 'https://developer.exist.io/reference/authentication/token/';

	properties: INodeProperties[] = [
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description:
				'Simple token from POST https://exist.io/api/2/auth/simple-token/. Read-only; use OAuth2 for write access.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Token {{$credentials?.accessToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://exist.io/api/2',
			url: '/accounts/profile/',
			method: 'GET',
		},
	};
}
