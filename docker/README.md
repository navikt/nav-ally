# NAV-Ally Docker Image

Docker image to run NAV-Ally with a local definition file.

## Validation with a local definition file

If you have a repository that is like this one:

```
myApp
  - src
    -- app
    -- test
        -- wcagtest.yml
  - bin
  - package.json
```

Then the following command run the validation from the `myApp` folder:

```
$ docker run -v "$(pwd)"/src/test:/nav-ally/uu navikt/nav-ally -f ./nav-ally/uu/wcagtest.yml
```

## Integration with Jenkins

Using a Jenkinsfile Docker-plugin:

```
stage("UU-test") {
    steps {
        script {
            docker.image("navikt/nav-ally").withRun("-v ${workspace}/src/test:/workspace navikt/nav-ally -f ./nav-ally/workspace/wcagtest.yml")
        }
    }
}

```

As a shell script:

```
stage("WCAG-test") {
	try {
      sh("docker pull navikt/nav-ally")
      def cmd = "docker run" +
              " --rm" +
              " -v ${workspace}/src/test:/workspace" +
              " navikt/nav-ally -f ./nav-ally/workspace/wcagtest.yml"
      println(cmd)
      sh(cmd)
  } catch (Exception e) {
      notifyOnError("UU-test failed.")
      throw e
  }
}

```

## Build a new Docker image

Run the following command (remember to set correct execution rights on `build.sh`):
```
$ sh build.sh navikt/nav-ally
```

If you want to run a test with the new image, then just add the filename also:

```
$ sh build.sh navikt/nav-ally wcagtest.yml
```