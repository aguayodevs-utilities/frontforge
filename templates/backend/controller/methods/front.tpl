  public async Get${FeatureCamel}(): Promise<void> {
      if(this.alreadyResponded) return;
      try {
        const service${FeatureCamel}: ${FeatureCamel}Service = new ${FeatureCamel}Service(this.req, this.res, this.next);
        const {html} = await service${FeatureCamel}.get();
        if(html){ 
          this.res.sendFile(html);
        }
      } catch (error) {
        this.next(error);
      }
  }