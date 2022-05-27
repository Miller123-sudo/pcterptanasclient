import ApiService from "../../../helpers/ApiServices";
import config from '../__config.json';

const QUERY_PATH = config ? config.queryPath.baseUrl : null;

const MOUNT = {
    NAVIGATE: null,
    PARAMS: null,
    ISADDMODE: true,
    CURRENT_RECORD_ID: null,
    PATH_NAME: null,
    DOCUMENT_TYPE_ID: null,
    ROOT_PATH: null,
    LOADER: null,
    SET_LOADER_FUN: null,

}


const AppListController = {
    initFormListSchema(setState) {
        ApiService.setHeader();
        return ApiService.get(`customDocumentType/documentSchema?docType=${MOUNT.DOCUMENT_TYPE_ID}&viewType=list`)
            .then(response => {
                console.log(response)
                if (response.data.isSuccess) {
                    setState(response.data.document)
                    if (MOUNT?.SET_LOADER_FUN)
                        MOUNT.SET_LOADER_FUN("SUCCESS")

                }

            })
            .catch(error => {
                console.log(error)
            });
    },

    initForm(setState) {
        ApiService.setHeader();
        return ApiService.get(`/customDocumentType/customDocument?docType=${MOUNT.DOCUMENT_TYPE_ID}`)
            .then(response => {
                console.log(response)
                if (response.data.isSuccess) {
                    setState(response.data.documents)
                    if (MOUNT?.SET_LOADER_FUN)
                        MOUNT.SET_LOADER_FUN("SUCCESS")
                }
            })
            .catch(error => {
                console.log(error)
            });
    },

    buttonActionController(event) {
        if (!event) return;

        switch (event.target.id) {
            case 'action_create':
                console.log("click")
                MOUNT.NAVIGATE(`/${MOUNT.ROOT_PATH}/customapp/list?doctype=${MOUNT.DOCUMENT_TYPE_ID}`)
                break;

            case 'action_cancel':
                MOUNT.NAVIGATE(`/${MOUNT.ROOT_PATH}/customapp/list?doctype=${MOUNT.DOCUMENT_TYPE_ID}`)
                break;

            default:
                return null;

        }

    },


}


export { AppListController, MOUNT }