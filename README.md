# jmeter-to-k6 ![CircleCI branch](https://img.shields.io/circleci/project/github/loadimpact/jmeter-to-k6/master.svg)

Convert [JMeter](https://jmeter.apache.org/) JMX to [k6](https://k6.io/) JS.

## Usage

**Install**:

![npm](https://img.shields.io/npm/v/jmeter-to-k6.svg) ![npm](https://img.shields.io/npm/dw/jmeter-to-k6.svg) ![dockerhub](https://img.shields.io/docker/pulls/loadimpact/jmeter-to-k6.svg)

Globally, and preferably using [nvm](https://github.com/creationix/nvm) (at least on Unix/Linux systems to avoid filesystem permission issues when using sudo):
```shell
npm install -g jmeter-to-k6
```

Locally, into `./node_modules`:
```shell
npm install jmeter-to-k6
```

Note that this will require you to run the converter with `node node_modules/jmeter-to-k6/bin/jmeter-to-k6.js ...`.

Alternatively, you can install the tool from DockerHub:
```shell
docker pull loadimpact/jmeter-to-k6
```

**Convert**:

```shell
jmeter-to-k6 example/full.jmx -o full
```

This will create a directory `./full/` with a file called `test.js` and a sub-directory called `libs`.

One-off execution using [npx](https://www.npmjs.com/package/npx) (avoiding the installation of the tool on your system):
```shell
npx jmeter-to-k6 example/full.jmx -o full
```

Using the Docker image, you execute the tool as follows:
```shell
docker run -it -v "/path/to/jmeter-files/:/output/" loadimpact/jmeter-to-k6 /output/MyTest.jmx -o /output/MyTestOutput/
```
and then execute the k6 test using:
```shell
k6 run /path/to/jmeter-files/MyTestOutput/test.js
```

**Run test in k6**:

```shell
k6 run full/test.js
```

## Other similar tools

- [postman-to-k6](https://github.com/loadimpact/postman-to-k6/): Convert
  Postman to k6 JS.
