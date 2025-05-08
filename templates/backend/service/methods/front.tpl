    // Método para obtener el HTML del frontend asociado
    public async get(): Promise<{html?:string}> {
        if(this.alreadyResponded) return {html:undefined};
        try {
            // Construye la ruta al index.html del micro-frontend correspondiente
            return {html:path.join(process.cwd(), "public", "${Domain}", "${FrontName}" , "index.html")};
        } catch (error) {
            throw new HttpException({
                message: "Default error for service.",
                statusCode: 500,
                filePath: "${RoutePath}",
                errorData: {
                    error: error as string,
                }
            });
        }
    }