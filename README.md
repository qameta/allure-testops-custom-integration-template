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

## Setting up the integration in Allure TestOps

1. In the Allure TestOps administration section, add an integration of the custom type. Specify its name and the endpoint: the URL where this service is available to Allure TestOps.
2. In the settings of the project, add the integration and fill in **Auth header**. Allure TestOps sends this value as is in the `Authorization` header of every request to the service, for example `Bearer <token>` or `Basic <base64>`.

The template doesn't check the `Authorization` header. Add the check before you expose the service.

## Endpoints

### Server Info

| #   | Method | Route          | Params | Response        |
| --- | ------ | -------------- | ------ | --------------- |
| 1   | `GET`  | `/server/info` | —      | `ExtServerInfo` |
| 2   | `GET`  | `/me`          | —      | `ExtUser`       |

### Job Management

| #   | Method | Route                        | Params                            | Response    |
| --- | ------ | ---------------------------- | --------------------------------- | ----------- |
| 3   | `GET`  | `/job`                       | `?query=`                         | `ExtJob[]`  |
| 4   | `GET`  | `/job/:id`                   | `:id`                             | `ExtJob`    |
| 5   | `POST` | `/job/:id/start`             | `:id`, body: `ExtJobStartRequest` | `ExtJobRun` |
| 6   | `GET`  | `/job/:id/:buildNumber`      | `:id`, `:buildNumber`             | `ExtJobRun` |
| 7   | `POST` | `/job/:id/:buildNumber/stop` | `:id`, `:buildNumber`             | `ExtJobRun` |

### Issue Tracking

| #   | Method | Route         | Params                                                  | Response         |
| --- | ------ | ------------- | ------------------------------------------------------- | ---------------- |
| 8   | `GET`  | `/issue`      | `?search=`                                              | `ExtIssueLink[]` |
| 9   | `GET`  | `/issue/:key` | `:key`                                                  | `ExtIssueLink`   |
| 10  | `GET`  | `/project`    | `?search=`                                              | `ExtProject[]`   |
| 11  | `GET`  | `/issuetype`  | `?projectKey=`                                          | `ExtIssueType[]` |
| 12  | `GET`  | `/issuefield` | `?projectKey=`, `?issueTypeId=`                         | `unknown[]`      |
| 13  | `POST` | `/issue`      | `?projectKey=`, `?issueTypeId=`, body: `ExtIssueCreate` | `ExtIssueLink`   |

### Test Cases

| #   | Method | Route                    | Params         | Response      |
| --- | ------ | ------------------------ | -------------- | ------------- |
| 14  | `GET`  | `/testcase/:testCaseKey` | `:testCaseKey` | `ExtTestLink` |

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
      "id": 1658,
      "selector": "io.qameta.allure.IssuesWebTest.shouldCloseIssue"
    },
    {
      "id": 1657,
      "selector": "io.qameta.allure.PullRequestsWebTest.shouldClosePullRequest"
    },
    {
      "id": 1656,
      "selector": "io.qameta.allure.IssuesWebTest.shouldAddLabelToIssue"
    }
  ],
  "parameters": {
    "name1": "value1",
    "name2": "value2",
    "name3": "value3"
  },
  "username": "jdoe"
}
```

The object contains:

1. `jobRunId` - job run identifier in Allure TestOps. With this parameter, allurectl can download the test plan and upload the results (see [Uploading test results](#uploading-test-results)).
2. `launchId` - launch identifier in Allure TestOps.
3. `tests` - list of tests for launch:
   1. `id` - test case ID from Allure TestOps (a number).
   2. `selector` - alternative ID, which by default equals Full Name.
4. `parameters` - job run parameters. When you start a job run from Allure TestOps, you can pass input parameters to the run, such as browser and base URL.
5. `username` - the Allure TestOps user who started the job run.

#### Expected response: code 201

Allure TestOps accepts any 2xx code. The template stub returns 200.

In the response, we need to receive:

1. `id` - of the run for subsequent requests.
2. `name` - of the run to display it nicely.
3. `url` - link to the run. Allure TestOps doesn't use it, see [Links to jobs and runs](#links-to-jobs-and-runs).
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

### Links to jobs and runs

Allure TestOps doesn't use the `url` field from the job and run responses. It builds the links itself from the endpoint of the integration:

- job: `<endpoint>/job/{id}`;
- run: `<endpoint>/job/{jobId}/{id}`.

These are the same paths as the API calls above, so a user who clicks a link in Allure TestOps opens this service. To send the user to your CI instead, answer browser requests to these paths (with `Accept: text/html`) with a redirect to the job or run page of your CI.

## Bi-directional integration

These parameters need to be available on the Custom CI side and accessible from the pipeline execution context (e.g. as a variable). Some of these can be hard-coded.

- **Name of the CI** - Name of the CI as pipeline run context variable. Optional, can be hard-coded to allurectl.
- **ID of the CI project** - Unique identifier of CI project.
- **URL of the CI project** - URL that an end user can open to see the details of CI project.
- **Name of the CI project** - Name of the project. Optional.
- **Unique identifier of the pipeline** - When a pipeline is executed, it should have a unique identifier, preferably across the whole CI, not on the project level.
- **URL of the CI pipeline** - URL an end user could use to access the pipeline execution and see the details.
- **Branch used for the pipeline execution** - Information on the VCS branch used to run the pipeline.

## Uploading test results

These are the calls the pipeline makes to Allure TestOps. All requests need the `Authorization: Api-Token <token>` header, where the token is an API token of an Allure TestOps user.

### With allurectl (recommended)

When Allure TestOps starts a job (`POST /job/{id}/start`), it has already created the job run and the launch. Pass `jobRunId` from the start request to the pipeline and let allurectl upload the results to this job run:

```shell
export ALLURE_ENDPOINT=https://testops.example.com
export ALLURE_TOKEN=<api-token>
export ALLURE_PROJECT_ID=1
export ALLURE_JOB_RUN_ID=<jobRunId from the start request>

allurectl watch --results build/allure-results -- <command that runs the tests>
```

allurectl also downloads the test plan of the job run, so that only the selected tests run.

### With the API

Use this sequence for pipelines that were not started from Allure TestOps.

1. **Start a job run**: `POST /api/rs/upload/start`

   ```json
   {
     "projectId": 1,
     "ci": {
       "type": "my-ci"
     },
     "job": {
       "uid": "my-job",
       "name": "My job",
       "url": "https://ci.example.com/job/my-job"
     },
     "jobRun": {
       "uid": "my-job-127",
       "name": "#127",
       "url": "https://ci.example.com/job/my-job/127"
     },
     "launch": {
       "name": "Regression"
     }
   }
   ```

   `job` and `jobRun` are required. `job.uid` must be the same for all runs of the job; the job is shown on the **Jobs** page of the project. `jobRun.uid` must be unique for each run; the run is shown on the **Job run** tab of the launch. `ci` and `launch` are optional.

   The response contains `projectId`, `launchId`, `jobId` and `jobRunId`.

2. **Create an upload session**: `POST /api/rs/upload/session`

   ```json
   {
     "projectId": 1,
     "jobUid": "my-job",
     "jobRunUid": "my-job-127"
   }
   ```

   Instead of `jobUid` and `jobRunUid`, you can pass `jobRunId`. The response contains the session `id`.

3. **Upload the files**: `POST /api/rs/upload/file?id=<session id>`, a multipart request with one `file` part per result file. Repeat as many times as needed. Zip archives go to `POST /api/rs/upload/archive?id=<session id>`.

4. **Stop the job run** after all files are uploaded: `POST /api/rs/upload/stop`

   ```json
   {
     "projectId": 1,
     "jobUid": "my-job",
     "jobRunUid": "my-job-127",
     "status": "passed"
   }
   ```

   `status` is optional: `passed`, `failed`, `cancelled` or `unknown`.

## Reading test results of a launch

To read the results of a launch, for example the one from `launchId` of the start request, use the Allure TestOps API with the same `Authorization: Api-Token <token>` header.

### Test results in a launch

`GET /api/rs/testresult/__search`

Query parameters:

1. `projectId` - ID of the project.
2. `rql` - query in the Allure TestOps query language, for example `launch = 7`.
3. `page` - page number, starting from 0.
4. `size` - page size, for example 100.

The response is a page: the results are in `content`, the number of pages is in `totalPages`.

```shell
export ENDPOINT=https://testops.example.com
export TOKEN=<api-token>

curl -s -G "${ENDPOINT}/api/rs/testresult/__search" \
  --header "Accept: application/json" \
  --header "Authorization: Api-Token ${TOKEN}" \
  --data-urlencode "projectId=1" \
  --data-urlencode 'rql=launch = 7 and status = "failed"' \
  --data-urlencode "page=0" \
  --data-urlencode "size=100"
```

### Environment of a launch

`GET /api/rs/launch/{id}/env`
