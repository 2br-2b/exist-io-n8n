import type { Icon, ICredentialType, INodeProperties } from 'n8n-workflow';

export class ExistIoOAuth2Api implements ICredentialType {
	name = 'existIoOAuth2Api';

	extends = ['oAuth2Api'];

	displayName = 'Exist.io OAuth2 API';

	icon: Icon = 'file:../icons/existio.svg';

	documentationUrl = 'https://developer.exist.io/reference/authentication/oauth2/';

	properties: INodeProperties[] = [
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorizationCode',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden',
			default: 'https://exist.io/oauth2/authorize',
			required: true,
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: 'https://exist.io/oauth2/access_token',
			required: true,
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'string',
			default:
				'activity_read productivity_read mood_read sleep_read workouts_read events_read finance_read food_read health_read location_read media_read social_read weather_read symptoms_read medication_read custom_read manual_read',
			description:
				'Space-separated list of scopes. Available read scopes: activity_read, productivity_read, mood_read, sleep_read, workouts_read, events_read, finance_read, food_read, health_read, location_read, media_read, social_read, weather_read, symptoms_read, medication_read, custom_read, manual_read. Write scopes are available by replacing _read with _write.',
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'header',
		},
	];
}
