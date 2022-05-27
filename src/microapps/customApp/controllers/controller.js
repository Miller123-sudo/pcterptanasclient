import ApiService from "../../../helpers/ApiServices";
import config from '../__config.json';


const QUERY_PATH = config ? config.queryPath.baseUrl : null;

const MOUNT = {
    NAVIGATE: null,
    PARAMS: null,
    ISADDMODE: true,
    CURRENT_RECORD_ID: null,
    DOCUMENT_TYPE_ID: null,
    ROOT_PATH: null,
    LOADER: null,
    SET_LOADER_FUN: null,
}



const AppController = {

    handleSubmit(formData) {
        console.log("Data", formData)
        return MOUNT.ISADDMODE ? this.createDocument(formData) : this.updateDocument(MOUNT.CURRENT_RECORD_ID, formData);
    },

    buttonActionController(event) {
        if (!event) return;

        switch (event.target.id) {
            case 'action_print_pdf':
                break;

            case 'action_cancel':
                MOUNT.NAVIGATE(`/${MOUNT.ROOT_PATH}/customapp/list?doctype=${MOUNT.DOCUMENT_TYPE_ID}`);
                break;
            default:
                return null;

        }

    },

    initFormSchema(setState) {
        ApiService.setHeader();
        return ApiService.get(`customDocumentType/documentSchema?docType=${MOUNT.DOCUMENT_TYPE_ID}&viewType=form`)
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

    initForm(reset) {
        ApiService.setHeader();
        return ApiService.get(`customDocumentType/customDocument/${MOUNT.CURRENT_RECORD_ID}?docType=${MOUNT.DOCUMENT_TYPE_ID}`)
            .then(response => {
                if (response.data.isSuccess) {
                    reset(response.data.document)
                    if (MOUNT?.SET_LOADER_FUN)
                        MOUNT.SET_LOADER_FUN("SUCCESS")
                }
            })
            .catch(error => {
                console.log(error)
            });
    },

    createDocument(data) {
        ApiService.setHeader();
        return ApiService.post(`/customDocumentType/customDocument?docType=${MOUNT.DOCUMENT_TYPE_ID}`, data)
            .then(response => {
                console.log(response)
                if (response.data.isSuccess)
                    MOUNT.NAVIGATE(`/${MOUNT.ROOT_PATH}/customapp/list?doctype=${MOUNT.DOCUMENT_TYPE_ID}`)
            })
            .catch(error => {
                console.log(error)
            });
    },

    updateDocument(id, data) {
        if (!id) return;
        ApiService.setHeader();
        return ApiService.patch(`customDocumentType/customDocument/${MOUNT.CURRENT_RECORD_ID}?docType=${MOUNT.DOCUMENT_TYPE_ID}`, data)
            .then(response => {
                if (response.data.isSuccess)
                    MOUNT.NAVIGATE(`/${MOUNT.ROOT_PATH}/customapp/list?doctype=${MOUNT.DOCUMENT_TYPE_ID}`)
            })
            .catch(error => {
                console.log(error)
            });

    },

    deleteDocument() {
        if (!MOUNT.CURRENT_RECORD_ID) return;
        ApiService.setHeader();
        return ApiService.delete(`customDocumentType/customDocument/${MOUNT.CURRENT_RECORD_ID}?docType=${MOUNT.DOCUMENT_TYPE_ID}`)
            .then(response => {
                if (response.status === 204)
                    MOUNT.NAVIGATE(`/${MOUNT.ROOT_PATH}/customapp/list?doctype=${MOUNT.DOCUMENT_TYPE_ID}`)
            })
            .catch(error => {
                console.log(error)
            });

    },

    handleBodyFieldChangeEvent(event, value, getValues, setValue) {
        console.log("Event", event);
        console.log("Value", value)
        if (!value) return;

        switch (value.id) {
            case '<Id of the field>':
                break;
            default:
                return null;
        }
    },

    handleBodyFieldBlurEvent(event, value, getValues, setValue) {
        if (!event) return;

        switch (event.target.id) {
            case '<Id of the field>':
                break;
            default:
                return null;
        }

    },
    handleLineFieldChangeEvent(event, value, getValues, setValue) {

    },
    handleLineFieldBlurEvent(event, value, getValues, setValue) {

    }

}

export { AppController, MOUNT }