import { TconstructorTypeService } from '../../../interfaces/Itemplates';
export declare class ConstructorClass {
    private projectRoot;
    private domain;
    private feature;
    private constructorType;
    private constructorBasePath;
    constructor(projectRoot: string, domain: string, feature: string, constructorType?: TconstructorTypeService);
    getCodeConstructor(): string;
}
//# sourceMappingURL=ConstructorClass.d.ts.map