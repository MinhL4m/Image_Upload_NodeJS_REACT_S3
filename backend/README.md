# Upload Image Using Nodejs, Express, S3, RDS

## Dependencies

- Multer: used for accepting a file through form data from the UI

  - This can be used to set up to use disk or in-memory storage.
  - Since we are using S3 for file storage we will set up as in memory which means we’ll receive the file as a buffer and can transfer straight to S3

- Sharp: to resize the images into thumbnails

- sequelize: ORM for Postgres, MySQL, MariaDB, SQLite and Microsoft SQL Server.

- sequelize-cli: Use to init the project + migrate data.

- List: aws-sdk, sequelize, sequelize-cli, pg, pg-hstore, multer, sharp, uuid, cors

## Set up

### AWS Site

- Create new bucket in S3 -> Bucket and objects not public
- Create new RDS (in this case, postgres was used)
- Config RDS instance to allow every access.
  - Click into the instance
  - Connectivity & security tab -> Security -> click on the VPC security groups -> Inbound ruls tab -> Edit inbound rule -> Add new rules -> type `all traffic` + source `0.0.0.0/0` `::/0`
- Create new user via IAM. This case, new user is in admin group with `AdministratorAccess` permission

### Local Side

- Create file: `~/.aws/credentials`:

```
[default]
aws_access_key_id = YOUR_ACCESS_KEY_ID
aws_secret_access_key = YOUR_SECRET_ACCESS_KEY
region = YOUR_S3_BUCKET_REGION (i.e. us-east-2)
```

- Those access key can be find when create an account in IAM -> after that only `aws access key id` can be found.

## How it work:

### For create new Image:

- Generate a GUID for image and thumbnail.
- Create a thumbnail image
- Save both images as new entries in the images table
- Create a new entry in the uploads table

### For Getting the Image

- generate a signed URL for each image stored in S3
- These images are not publicly available so we use the AWS SDK to create a pre-authorized URL (These URLs will expire after a certain period of time and will no longer be valid)

## sequelize-cli

- Here is the command used in the project:

`npx sequelize-cli init`: To init the project with sequelize files

`npx sequelize-cli model:generate --name <name> --attributes <name:datatype>`: Generate Model/Table file

    - Sample: `npx sequelize-cli model:generate --name images --attributes id:uuid,bucket:string,key:string`

`npx sequelize-cli db:migrate`: migarate create new table in the db.

## Read more:

[AWS Docs](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/getting-started-nodejs.html)

[signed URL](https://cloud.google.com/storage/docs/access-control/signed-urls)
