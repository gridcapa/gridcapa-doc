/// Envoyer un email au maintainers dans le cas d'une erreur
def maintainers = "sebastien.murgey@rte-france.com"

properties([
    disableConcurrentBuilds()
])

node("build") {
    try {
        stageDevin ("🦊 Checkout") {
            gitCheckout {}
        }

        stageDevin ("🐳 Build docker") {
            echo "🐳 Construction Docker"
            dockerBuild{
                dockerContext = "Dockerfile,package.json"
                repo = "gridcapa"
                imgName = "gridcapa-doc-caddy"
                keepBuiltImage = false
                cleanWorkspace = true
                targetPtf = "gridcapa"
                push = true
                path = "./"
                registry = "inca.rte-france.com"
                prefixRegistry = true
            }
        }

    } catch (Exception e) {
        notify {
            to = maintainers
            errorMsg = e.toString()
        }
        throw e
    } finally {
        echo "🗑️ Nettoyage du workspace"
        step([$class: "WsCleanup"])
    }
}
