# Allure TestOps CI Integration Template

## Usage

```shell
npm i
```

## Development

```shell
npm run dev
```

## Build and run

```shell
npm run build
node ./dist/index.js
```

Or:

```shell
docker compose build
docker compose up -d
```

## Endpoints

### Server Info

| # | Method | Route | Params | Response |
|---|--------|-------|--------|----------|
| 1 | `GET` | `/server/info` | — | `ExtServerInfo` |
| 2 | `GET` | `/me` | — | `ExtUser` |

### Job Management

| # | Method | Route | Params | Response |
|---|--------|-------|--------|----------|
| 3 | `GET` | `/job` | `?query=` | `ExtJob[]` |
| 4 | `GET` | `/job/:id` | `:id` | `ExtJob` |
| 5 | `POST` | `/job/:id/start` | `:id`, body: `ExtJobStartRequest` | `ExtJobRun` |
| 6 | `GET` | `/job/:id/:buildNumber` | `:id`, `:buildNumber` | `ExtJobRun` |
| 7 | `POST` | `/job/:id/:buildNumber/stop` | `:id`, `:buildNumber` | `ExtJobRun` |

### Issue Tracking

| # | Method | Route | Params | Response |
|---|--------|-------|--------|----------|
| 8 | `GET` | `/issue` | `?search=` | `ExtIssueLink[]` |
| 9 | `GET` | `/issue/:key` | `:key` | `ExtIssueLink` |
| 10 | `GET` | `/project` | `?search=` | `ExtProject[]` |
| 11 | `GET` | `/issuetype` | `?projectKey=` | `ExtIssueType[]` |
| 12 | `GET` | `/issuefield` | `?projectKey=`, `?issueTypeId=` | `unknown[]` |
| 13 | `POST` | `/issue` | `?projectKey=`, `?issueTypeId=`, body: `ExtIssueCreate` | `ExtIssueLink` |

### Test Cases

| # | Method | Route | Params | Response |
|---|--------|-------|--------|----------|
| 14 | `GET` | `/testcase/:testCaseKey` | `:testCaseKey` | `ExtTestLink` |

## API calls

These are the API calls Allure TestOps sends towards the custom CI.

On the integration side, it is necessary to implement API to transfer data between TestOps and Custom Integration.

### 1. Service availability validation

Invoked when clicking the Test Connection button.

#### Request

`GET /server/info`

#### Expected response: code 200 OK

```json
{
  "name": "My custom CI"
}
```

#### Logic

It is important that the request is executed and a response with status code 200 is received.

### 1.1. Request for the authorized user

Invoked when clicking the Test Connection button.

#### Request

`GET /me`

#### Expected response: code 200 OK

```json
{
  "id": "Identifier in your system",
  "name": "Username in your system"
}
```

#### Logic

It is important that the request is executed and a response with status code 200 is received, and the username will be displayed in the integration.

### 2. Searching for jobs

Optional. Used when creating a new job from TestOps.

#### Request

`GET /job`

You can pass the `query` parameter in the request.

Example: `<endpoint>/job?query=part_of_job_name`

#### Expected response: code 200 OK

A list of job objects is returned.

```json
[
  {
    "externalId": "Job identifier in custom integration",
    "name": "Job name",
    "url": "http://hello.world/123",
    "parameters": [
      {
        "name": "Name of internal job parameter",
        "value": "Value of internal parameter"
      },
      {
        "name": "branch",
        "value": "master"
      }
    ]
  }
]
```

### 3. Retrieving job information

#### Request

`GET /job/{id}`

Example: `<endpoint>/job/externalId`

#### Expected response: code 200 OK

```json
{
  "externalId": "Job identifier in custom integration",
  "name": "Job name",
  "url": "http://hello.world/123",
  "parameters": [
    {
      "name": "Name of internal job parameter",
      "value": "Value of internal parameter"
    },
    {
      "name": "branch",
      "value": "master"
    }
  ]
}
```

### 4. Job start

Triggers the pipeline execution.

#### Request

`POST /job/{id}/start`

The request body contains an object for starting:

```json
{
  "jobRunId": 123,
  "launchId": 123,
  "tests": [
    {
      "id": "1658",
      "selector": "io.qameta.allure.IssuesWebTest.shouldCloseIssue"
    },
    {
      "id": "1657",
      "selector": "io.qameta.allure.PullRequestsWebTest.shouldClosePullRequest"
    },
    {
      "id": "1656",
      "selector": "io.qameta.allure.IssuesWebTest.shouldAddLabelToIssue"
    }
  ],
  "parameters": {
    "name1": "value1",
    "name2": "value2",
    "name3": "value3"
  }
}
```

The object contains:

1. `jobRunId` - job run identifier in Allure TestOps. With this parameter, allurectl can download the test plan and upload the results.
2. `launchId` - launch identifier in Allure TestOps.
3. `tests` - list of tests for launch:
   1. `id` - test case ID from Allure TestOps.
   2. `selector` - alternative ID, which by default equals Full Name.
4. `parameters` - job run parameters. When you start a job run from Allure TestOps, you can pass input parameters to the run, such as browser and base URL.

#### Expected response: code 201

In the response, we need to receive:

1. `id` - of the run for subsequent requests.
2. `name` - of the run to display it nicely.
3. `url` - link, so that there is a clickable link in Allure TestOps.
4. `stage` - status of the run: `RUN_FAILURE`, `SCHEDULED`, `IN_PROGRESS`, `FINISHED`.
5. `status` - execution status: `CANCELLED`, `PASSED`, `FAILED`, `UNKNOWN`.

```json
{
  "id": "123",
  "name": "hello, world",
  "url": "http://hello.world/123",
  "stage": "SCHEDULED",
  "status": "UNKNOWN"
}
```

### 5. Job status

Checks the triggered pipeline execution status. The `id` parameter from the previous section will be used.

#### Request

`GET /job/{jobId}/{id}`

#### Expected response: code 200 OK

```json
{
  "id": "123",
  "name": "hello, world",
  "url": "http://hello.world/123",
  "stage": "FINISHED",
  "status": "PASSED"
}
```

### 6. Job stop

Tries to stop execution of a running pipeline. The `id` parameter from the previous section will be used.

#### Request

`POST /job/{jobId}/{id}/stop`

#### Expected response: code 200 OK

```json
{
  "id": "123",
  "name": "hello, world",
  "url": "http://hello.world/123",
  "stage": "FINISHED",
  "status": "CANCELLED"
}
```

## Bi-directional integration

These parameters need to be available on the Custom CI side and accessible from the pipeline execution context (e.g. as a variable). Some of these can be hard-coded.

- **Name of the CI** - Name of the CI as pipeline run context variable. Optional, can be hard-coded to allurectl.
- **ID of the CI project** - Unique identifier of CI project.
- **URL of the CI project** - URL that an end user can open to see the details of CI project.
- **Name of the CI project** - Name of the project. Optional.
- **Unique identifier of the pipeline** - When a pipeline is executed, it should have a unique identifier, preferably across the whole CI, not on the project level.
- **URL of the CI pipeline** - URL an end user could use to access the pipeline execution and see the details.
- **Branch used for the pipeline execution** - Information on the VCS branch used to run the pipeline.

