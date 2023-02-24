import { FuseUtils } from '../../../../core/fuseUtils';

export class List
{
    id: string;
    name: string;
    idCards: string[];

    constructor(list)
    {
        this.id = list.id || FuseUtils.generateGUID();
        this.name = list.name || '';
        this.idCards = [];
    }
}
