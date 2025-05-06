/// Envoyer un email au maintainers dans le cas d'une erreur
def maintainers = "sebastien.murgey@rte-france.com"

properties([
    disableConcurrentBuilds()
])

node("build") {
    try {
        stageDevin ("Checkout") {
            gitCheckout {}
        }

        stageDevin ("Build website") {
            npmInstall {}
            npm {
                args = "run build"
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
