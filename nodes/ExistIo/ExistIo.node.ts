import type { INodeType, INodeTypeDescription } from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

export class ExistIo implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Exist.io',
		name: 'existIo',
		icon: 'file:../../icons/existio.svg',
		group: ['transform'],
		usableAsTool: true,
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the Exist.io personal analytics API',
		defaults: {
			name: 'Exist.io',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'existIoApi',
				required: true,
				displayOptions: { show: { authentication: ['apiToken'] } },
			},
			{
				name: 'existIoOAuth2Api',
				required: true,
				displayOptions: { show: { authentication: ['oAuth2'] } },
			},
		],
		requestDefaults: {
			baseURL: 'https://exist.io/api/2',
			headers: {
				Accept: 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{ name: 'API Token', value: 'apiToken' },
					{ name: 'OAuth2', value: 'oAuth2' },
				],
				default: 'apiToken',
			},
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Attribute', value: 'attribute' },
					{ name: 'Average', value: 'average' },
					{ name: 'Correlation', value: 'correlation' },
					{ name: 'Insight', value: 'insight' },
					{ name: 'Profile', value: 'profile' },
				],
				default: 'profile',
			},

			// ---------- Profile ----------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['profile'] } },
				options: [
					{
						name: 'Get',
						value: 'get',
						action: 'Get the authenticated user profile',
						routing: { request: { method: 'GET', url: '/accounts/profile/' } },
					},
				],
				default: 'get',
			},

			// ---------- Attribute ----------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['attribute'] } },
				options: [
					{
						name: 'Acquire',
						value: 'acquire',
						action: 'Acquire ownership of attributes',
						routing: { request: { method: 'POST', url: '/attributes/acquire/' } },
					},
					{
						name: 'Create',
						value: 'create',
						action: 'Create new attributes',
						routing: { request: { method: 'POST', url: '/attributes/create/' } },
					},
					{
						name: 'Get Many',
						value: 'getMany',
						action: 'List attributes',
						routing: { request: { method: 'GET', url: '/attributes/' } },
					},
					{
						name: 'Get Owned',
						value: 'getOwned',
						action: 'List attributes owned by this client',
						routing: { request: { method: 'GET', url: '/attributes/owned/' } },
					},
					{
						name: 'Get Templates',
						value: 'getTemplates',
						action: 'List supported attribute templates',
						routing: { request: { method: 'GET', url: '/attributes/templates/' } },
					},
					{
						name: 'Get Values',
						value: 'getValues',
						action: 'Get values for a single attribute',
						routing: { request: { method: 'GET', url: '/attributes/values/' } },
					},
					{
						name: 'Get With Values',
						value: 'getWithValues',
						action: 'List attributes with recent values',
						routing: { request: { method: 'GET', url: '/attributes/with-values/' } },
					},
					{
						name: 'Increment',
						value: 'increment',
						action: 'Increment attribute values',
						routing: { request: { method: 'POST', url: '/attributes/increment/' } },
					},
					{
						name: 'Release',
						value: 'release',
						action: 'Release ownership of attributes',
						routing: { request: { method: 'POST', url: '/attributes/release/' } },
					},
					{
						name: 'Update',
						value: 'update',
						action: 'Update attribute values',
						routing: { request: { method: 'POST', url: '/attributes/update/' } },
					},
				],
				default: 'getMany',
			},

			// Required field: Get Values
			{
				displayName: 'Attribute Name',
				name: 'attribute',
				type: 'string',
				required: true,
				default: '',
				description: 'Name of the attribute to fetch values for (e.g. "steps")',
				displayOptions: { show: { resource: ['attribute'], operation: ['getValues'] } },
				routing: { request: { qs: { attribute: '={{$value}}' } } },
			},

			// Filters for GET list ops
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: {
					show: {
						resource: ['attribute'],
						operation: [
							'getMany',
							'getWithValues',
							'getValues',
							'getTemplates',
							'getOwned',
						],
					},
				},
				options: [
					{
						displayName: 'Attributes',
						name: 'attributes',
						type: 'string',
						default: '',
						description: 'Comma-separated attribute names to filter by',
						displayOptions: {
							show: {
								'/operation': ['getMany', 'getWithValues', 'getOwned'],
							},
						},
						routing: { request: { qs: { attributes: '={{$value}}' } } },
					},
					{
						displayName: 'Date Max',
						name: 'date_max',
						type: 'string',
						default: '',
						placeholder: 'YYYY-MM-DD',
						description: 'Upper date bound (inclusive)',
						displayOptions: {
							show: { '/operation': ['getWithValues', 'getValues'] },
						},
						routing: { request: { qs: { date_max: '={{$value}}' } } },
					},
					{
						displayName: 'Days',
						name: 'days',
						type: 'number',
						default: 7,
						description: 'Number of days of values to include',
						displayOptions: { show: { '/operation': ['getWithValues'] } },
						routing: { request: { qs: { days: '={{$value}}' } } },
					},
					{
						displayName: 'Exclude Custom',
						name: 'exclude_custom',
						type: 'boolean',
						default: false,
						description: 'Whether to omit custom attributes from results',
						displayOptions: { show: { '/operation': ['getMany', 'getOwned'] } },
						routing: { request: { qs: { exclude_custom: '={{$value}}' } } },
					},
					{
						displayName: 'Groups',
						name: 'groups',
						type: 'string',
						default: '',
						description: 'Comma-separated group names (e.g. "activity,mood")',
						displayOptions: {
							show: {
								'/operation': [
									'getMany',
									'getWithValues',
									'getTemplates',
									'getOwned',
								],
							},
						},
						routing: { request: { qs: { groups: '={{$value}}' } } },
					},
					{
						displayName: 'Include Inactive',
						name: 'include_inactive',
						type: 'boolean',
						default: false,
						description: 'Whether to include attributes no longer being tracked',
						displayOptions: { show: { '/operation': ['getMany', 'getOwned'] } },
						routing: { request: { qs: { include_inactive: '={{$value}}' } } },
					},
					{
						displayName: 'Include Low Priority',
						name: 'include_low_priority',
						type: 'boolean',
						default: false,
						description: 'Whether to include low-priority attributes',
						displayOptions: {
							show: { '/operation': ['getMany', 'getTemplates', 'getOwned'] },
						},
						routing: { request: { qs: { include_low_priority: '={{$value}}' } } },
					},
					{
						displayName: 'Limit',
						name: 'limit',
						type: 'number',
						description: 'Max number of results to return',
						typeOptions: { minValue: 1, maxValue: 100 },
						default: 50,
						routing: { request: { qs: { limit: '={{$value}}' } } },
					},
					{
						displayName: 'Manual Only',
						name: 'manual',
						type: 'boolean',
						default: false,
						description: 'Whether to only include manually-tracked attributes',
						displayOptions: {
							show: { '/operation': ['getMany', 'getWithValues', 'getOwned'] },
						},
						routing: { request: { qs: { manual: '={{$value}}' } } },
					},
					{
						displayName: 'Owned Only',
						name: 'owned',
						type: 'boolean',
						default: false,
						description: 'Whether to only return attributes owned by this client',
						displayOptions: { show: { '/operation': ['getMany'] } },
						routing: { request: { qs: { owned: '={{$value}}' } } },
					},
					{
						displayName: 'Page',
						name: 'page',
						type: 'number',
						default: 1,
						description: 'Page number to return',
						routing: { request: { qs: { page: '={{$value}}' } } },
					},
					{
						displayName: 'Templates',
						name: 'templates',
						type: 'string',
						default: '',
						description: 'Comma-separated template names',
						displayOptions: { show: { '/operation': ['getWithValues'] } },
						routing: { request: { qs: { templates: '={{$value}}' } } },
					},
				],
			},

			// Write-op forms
			{
				displayName: 'Acquire Items',
				name: 'acquireItems',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true, maxValue: 35 },
				placeholder: 'Add Attribute',
				default: {},
				displayOptions: { show: { resource: ['attribute'], operation: ['acquire'] } },
				options: [
					{
						name: 'item',
						displayName: 'Attribute',
						values: [
							{
								displayName: 'Template',
								name: 'template',
								type: 'string',
								default: '',
								description: 'Template name (omit if defining a brand-new custom attribute name)',
							},
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								description: 'Attribute name (required for existing / custom attributes)',
							},
							{
								displayName: 'Manual',
								name: 'manual',
								type: 'boolean',
								default: false,
							},
							{
								displayName: 'Success Objects',
								name: 'success_objects',
								type: 'boolean',
								default: false,
								description: 'Whether to return full attribute objects on success',
							},
						],
					},
				],
				routing: {
					request: {
						body:
							'={{ ($parameter["acquireItems"].item || []).map(i => Object.fromEntries(Object.entries(i).filter(([,v]) => v !== "" && v !== null && v !== undefined))) }}',
					},
				},
			},
			{
				displayName: 'Release Items',
				name: 'releaseItems',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true, maxValue: 35 },
				placeholder: 'Add Attribute',
				default: {},
				displayOptions: { show: { resource: ['attribute'], operation: ['release'] } },
				options: [
					{
						name: 'item',
						displayName: 'Attribute',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								required: true,
							},
						],
					},
				],
				routing: {
					request: { body: '={{ $parameter["releaseItems"].item || [] }}' },
				},
			},
			{
				displayName: 'Create Items',
				name: 'createItems',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true, maxValue: 35 },
				placeholder: 'Add Attribute',
				default: {},
				displayOptions: { show: { resource: ['attribute'], operation: ['create'] } },
				options: [
					{
						name: 'item',
						displayName: 'Attribute',
						values: [
							{
						displayName: 'Group',
						name: 'group',
						type: 'string',
						default: '',
						description: 'Group name the attribute belongs to',
							},
							{
						displayName: 'Label',
						name: 'label',
						type: 'string',
						default: '',
						description: 'User-facing title (required for custom attributes)',
							},
							{
						displayName: 'Manual',
						name: 'manual',
						type: 'boolean',
						default: false,
							},
							{
						displayName: 'Template',
						name: 'template',
						type: 'string',
						default: '',
						description: 'Template name (leave blank for a fully custom attribute)',
							},
							{
						displayName: 'Value Type',
						name: 'value_type',
						type: 'options',
						default: 0,
						description: 'Value type identifier (required for custom attributes)',
						options: [
									{
										name: 'Integer',
										value: 0
									},
									{
										name: 'Decimal',
										value: 1
									},
									{
										name: 'String',
										value: 2
									},
									{
										name: 'Time of Day',
										value: 3
									},
									{
										name: 'Period (Ms)',
										value: 4
									},
									{
										name: 'Boolean',
										value: 5
									},
									{
										name: 'Scale',
										value: 6
									},
									{
										name: 'Percentage',
										value: 7
									},
								]
							},
					],
					},
				],
				routing: {
					request: {
						body:
							'={{ ($parameter["createItems"].item || []).map(i => Object.fromEntries(Object.entries(i).filter(([,v]) => v !== "" && v !== null && v !== undefined))) }}',
					},
				},
			},
			{
				displayName: 'Updates',
				name: 'updateItems',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true, maxValue: 35 },
				placeholder: 'Add Update',
				default: {},
				displayOptions: { show: { resource: ['attribute'], operation: ['update'] } },
				options: [
					{
						name: 'item',
						displayName: 'Update',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								required: true,
							},
							{
								displayName: 'Date',
								name: 'date',
								type: 'string',
								default: '',
								placeholder: 'YYYY-MM-DD',
								required: true,
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'String, integer, or decimal value (as appropriate for the attribute)',
							},
						],
					},
				],
				routing: {
					request: { body: '={{ $parameter["updateItems"].item || [] }}' },
				},
			},
			{
				displayName: 'Increments',
				name: 'incrementItems',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true, maxValue: 35 },
				placeholder: 'Add Increment',
				default: {},
				displayOptions: { show: { resource: ['attribute'], operation: ['increment'] } },
				options: [
					{
						name: 'item',
						displayName: 'Increment',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								required: true,
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'number',
								default: 1,
								description: 'Delta to apply (integer or decimal)',
							},
							{
								displayName: 'Date',
								name: 'date',
								type: 'string',
								default: '',
								placeholder: 'YYYY-MM-DD (defaults to today)',
							},
						],
					},
				],
				routing: {
					request: {
						body:
							'={{ ($parameter["incrementItems"].item || []).map(i => Object.fromEntries(Object.entries(i).filter(([,v]) => v !== "" && v !== null && v !== undefined))) }}',
					},
				},
			},

			// ---------- Insight ----------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['insight'] } },
				options: [
					{
						name: 'Get Many',
						value: 'getMany',
						action: 'List insights',
						routing: { request: { method: 'GET', url: '/insights/' } },
					},
				],
				default: 'getMany',
			},
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: { show: { resource: ['insight'], operation: ['getMany'] } },
				options: [
					{
						displayName: 'Date Max',
						name: 'date_max',
						type: 'string',
						default: '',
						placeholder: 'YYYY-MM-DD',
						description: 'Upper date bound (inclusive)',
						routing: { request: { qs: { date_max: '={{$value}}' } } },
					},
					{
						displayName: 'Date Min',
						name: 'date_min',
						type: 'string',
						default: '',
						placeholder: 'YYYY-MM-DD',
						description: 'Lower date bound (inclusive)',
						routing: { request: { qs: { date_min: '={{$value}}' } } },
					},
					{
						displayName: 'Limit',
						name: 'limit',
						type: 'number',
						description: 'Max number of results to return',
						typeOptions: { minValue: 1, maxValue: 100 },
						default: 50,
						routing: { request: { qs: { limit: '={{$value}}' } } },
					},
					{
						displayName: 'Page',
						name: 'page',
						type: 'number',
						default: 1,
						description: 'Page number to return',
						routing: { request: { qs: { page: '={{$value}}' } } },
					},
					{
						displayName: 'Priority',
						name: 'priority',
						type: 'options',
						default: 1,
						description: 'Filter by insight priority',
						options: [
							{ name: '1 — Highest', value: 1 },
							{ name: '2', value: 2 },
							{ name: '3', value: 3 },
							{ name: '4 — Lowest', value: 4 },
						],
						routing: { request: { qs: { priority: '={{$value}}' } } },
					},
				],
			},

			// ---------- Average ----------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['average'] } },
				options: [
					{
						name: 'Get Many',
						value: 'getMany',
						action: 'List averages',
						routing: { request: { method: 'GET', url: '/averages/' } },
					},
				],
				default: 'getMany',
			},
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: { show: { resource: ['average'], operation: ['getMany'] } },
				options: [
					{
						displayName: 'Attributes',
						name: 'attributes',
						type: 'string',
						default: '',
						description: 'Comma-separated attribute names',
						routing: { request: { qs: { attributes: '={{$value}}' } } },
					},
					{
						displayName: 'Date Max',
						name: 'date_max',
						type: 'string',
						default: '',
						placeholder: 'YYYY-MM-DD',
						description: 'Upper date bound (inclusive)',
						routing: { request: { qs: { date_max: '={{$value}}' } } },
					},
					{
						displayName: 'Date Min',
						name: 'date_min',
						type: 'string',
						default: '',
						placeholder: 'YYYY-MM-DD',
						description: 'Lower date bound (inclusive)',
						routing: { request: { qs: { date_min: '={{$value}}' } } },
					},
					{
						displayName: 'Groups',
						name: 'groups',
						type: 'string',
						default: '',
						description: 'Comma-separated group names',
						routing: { request: { qs: { groups: '={{$value}}' } } },
					},
					{
						displayName: 'Include Historical',
						name: 'include_historical',
						type: 'boolean',
						default: false,
						description: 'Whether to include historical week-over-week averages',
						routing: { request: { qs: { include_historical: '={{$value}}' } } },
					},
					{
						displayName: 'Limit',
						name: 'limit',
						type: 'number',
						description: 'Max number of results to return',
						typeOptions: { minValue: 1, maxValue: 100 },
						default: 50,
						routing: { request: { qs: { limit: '={{$value}}' } } },
					},
					{
						displayName: 'Page',
						name: 'page',
						type: 'number',
						default: 1,
						description: 'Page number to return',
						routing: { request: { qs: { page: '={{$value}}' } } },
					},
				],
			},

			// ---------- Correlation ----------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['correlation'] } },
				options: [
					{
						name: 'Get Many',
						value: 'getMany',
						action: 'List correlations',
						routing: { request: { method: 'GET', url: '/correlations/' } },
					},
					{
						name: 'Get Combo',
						value: 'getCombo',
						action: 'Get correlation for two attributes',
						routing: { request: { method: 'GET', url: '/correlations/combo/' } },
					},
				],
				default: 'getMany',
			},
			{
				displayName: 'Attribute',
				name: 'comboAttribute',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['correlation'], operation: ['getCombo'] } },
				routing: { request: { qs: { attribute: '={{$value}}' } } },
			},
			{
				displayName: 'Attribute 2',
				name: 'comboAttribute2',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['correlation'], operation: ['getCombo'] } },
				routing: { request: { qs: { attribute2: '={{$value}}' } } },
			},
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: { show: { resource: ['correlation'], operation: ['getMany'] } },
				options: [
					{
						displayName: 'Attribute',
						name: 'attribute',
						type: 'string',
						default: '',
						description: 'Filter to correlations involving this attribute',
						routing: { request: { qs: { attribute: '={{$value}}' } } },
					},
					{
						displayName: 'Confident Only',
						name: 'confident',
						type: 'boolean',
						default: false,
						description: 'Whether to only return confident correlations',
						routing: { request: { qs: { confident: '={{$value}}' } } },
					},
					{
						displayName: 'Limit',
						name: 'limit',
						type: 'number',
						description: 'Max number of results to return',
						typeOptions: { minValue: 1, maxValue: 100 },
						default: 50,
						routing: { request: { qs: { limit: '={{$value}}' } } },
					},
					{
						displayName: 'Page',
						name: 'page',
						type: 'number',
						default: 1,
						description: 'Page number to return',
						routing: { request: { qs: { page: '={{$value}}' } } },
					},
					{
						displayName: 'Strong Only',
						name: 'strong',
						type: 'boolean',
						default: false,
						description: 'Whether to only return strong correlations',
						routing: { request: { qs: { strong: '={{$value}}' } } },
					},
				],
			},
		],
	};
}
