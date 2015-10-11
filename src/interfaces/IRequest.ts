///<reference path="IQueryOptions.ts" />

interface IRequest {
    command: string;
    id: string;
    record: IRecord;
    echo: boolean;
    filter: any;
    options: IQueryOptions;
    version: string;
    nodeId?: string;
    rights: { [key: string]: boolean};
    access: { [key: string]: boolean};
}
