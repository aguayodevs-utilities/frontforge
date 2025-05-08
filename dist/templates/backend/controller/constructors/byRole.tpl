  private alreadyResponded = true;    // Bandera
  private mainDomain: string = process.env.MAIN_DOMAIN || "";
  constructor(private req: Request, private res: Response, private next: NextFunction) {
    this.isValidRoleSession();
  }

  private isValidRoleSession(): void {
    let jwtToken: GenericToken = new GenericToken(
      "${RelativePathController}/${ControllerFileName}.ts",
      this.req.session.token,
    );

    if (!jwtToken.payload) {
      this.res.redirect("/sso/session/login");
    } else if (jwtToken.payload?.role !== "${SessionRole}") {
      this.res.redirect(`/${jwtToken.payload.role}/welcome`);
    } else {
      this.alreadyResponded = false;
    }
  }
