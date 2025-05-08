export interface Itemplates {
    domain?: string;
    feature?: string;
    projectName?: string;
    useRouter?: boolean;
    port?: number;
}
export type TconstructorTypeController = "byRole" | "byFeature";
export type TconstructorTypeService = "default";
export type TmethodTypeController = "front";
export type TmethodTypeService = "front";
export interface IcreateTestComponent extends Itemplates {
    projectFullPath: string;
    projectName: string;
}
export interface IcreatePreact extends Itemplates {
    projectFullPath: string;
    projectName: string;
}
export interface IcreateController extends Itemplates {
    domain: string;
    feature: string;
    constructorType?: TconstructorTypeController;
    middlewareSnakeCase?: string;
    methodType?: TmethodTypeController;
}
export interface IcreateService extends Itemplates {
    domain: string;
    feature: string;
    constructorType?: TconstructorTypeService;
    methodType?: TmethodTypeService;
}
//# sourceMappingURL=Itemplates.d.ts.map