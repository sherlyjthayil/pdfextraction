sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageBox, MessageToast) {
        "use strict";

        return Controller.extend("sap.btp.pdfupload.controller.View1", {
            onInit: function () {
                var oModel = new JSONModel();
                this.getView().setModel(oModel, "invoice");
                var oModel2 = {
                    editable: false,
                    visibleEnabled:false,
                    refreshEnabled: false,
                    uploadEnabled: false
                }
                this.getView().setModel(new JSONModel(oModel2), "viewModel")
            },
            onFileChange: function (oEvent) {
                var oFileUploader = this.byId("fileUploader");
                if (oFileUploader.getValue()) {
                    (this.getView().getModel("viewModel")).setProperty("/uploadEnabled", true)
                }
            },
            
            onUploadChange: function (oEvent) {
                if (oEvent.getParameter("files") && oEvent.getParameter("files")[0]) {
                   // this.addHeaderParameters();
                }
            },
           
            _resetData: function() {
                this.getView().getModel("invoice").setData({})
                this._jobId = "";
            },
            onUploadFile: async function () {
                var sresText=this.getView().getModel("i18n").getResourceBundle().getText("confirmText");
                if (this._jobId) {
                    MessageBox.confirm(sresText, {
                        onClose: async (oAction) => {
                            if (oAction === "OK") {
                                this._resetData();
                                await this._uploadImage()
                            }
                        }
                    })
                } else {
                    await this._uploadImage();
                }
            },
            _uploadImage: async function(){
                var oFileUploader = this.byId("fileUploader");
                var oUploadedFile = oFileUploader.oFileUpload.files[0];
                var blob = new Blob([oUploadedFile], {
                    type: oUploadedFile.type
                });
                var formData = new FormData();
                formData.append("file", blob, oUploadedFile.name);
                var options = {
                    "clientId": "default",
                    "extraction": {
                        "headerFields": [
                            "documentNumber",
                            "purchaseOrderNumber",
                            "documentDate",
                            "dueDate",
                            "grossAmount",
                            "currencyCode"
                        ],
                        "lineItemFields": [
                            "description",
                            "quantity",
                            "unitOfMeasure",
                            "unitPrice",
                            "netAmount"
                        ]
                    },
                    "documentType": "invoice"    
                };
                formData.append('options', JSON.stringify(options));
                this._postToDie(formData);
                this.getView().getModel("viewModel").setProperty("/visibleEnabled", true)
            },
            _getbaseUrl: function () {
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/")
                var appModulePath = jQuery.sap.getModulePath(appPath);
                return appModulePath + "/doc-info-extraction"
            },
            _postToDie: function (formData) {
                var dieUrl = this._getbaseUrl() + "/document/jobs";
                /* var authToken = "eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vYjEzYjU2NmF0cmlhbC5hdXRoZW50aWNhdGlvbi51czEwLmhhbmEub25kZW1hbmQuY29tL3Rva2VuX2tleXMiLCJraWQiOiJkZWZhdWx0LWp3dC1rZXktMjg1MTg0NzU5IiwidHlwIjoiSldUIiwiamlkIjogIk9vRStRL1BPeHRzcllYbTZzNnRQMitzc2VhM3BIZG5PTmwyMjlsN1FjUlk9In0.eyJqdGkiOiJiYzY5NmE1Y2FkZDE0NjE2YjE4MDVmYjgxZmU2YzBhOSIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiJmOTY3YzBmNS0yZTg5LTQ2NTktOTBhMi05NDZkN2YwYmNlZDYiLCJ6ZG4iOiJiMTNiNTY2YXRyaWFsIiwic2VydmljZWluc3RhbmNlaWQiOiJlNWE0ZWY4ZC1mMWNjLTQwNDktYjRjYS02NWFmODUyMDk1NmEifSwic3ViIjoic2ItZTVhNGVmOGQtZjFjYy00MDQ5LWI0Y2EtNjVhZjg1MjA5NTZhIWIxNjUwMzB8ZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQiLCJhdXRob3JpdGllcyI6WyJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NC5zY2hlbWEud3JpdGUiLCJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NC5pZGVudGlmaWVyLnJlYWQiLCJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NC5kb2N1bWVudC53cml0ZSIsImRveC14c3VhYS1zdGQtdHJpYWwhYjEwODQ0LnRlbXBsYXRlLnJlYWQiLCJ1YWEucmVzb3VyY2UiLCJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NC5ydWxlcy53cml0ZSIsImRveC14c3VhYS1zdGQtdHJpYWwhYjEwODQ0LnRlbXBsYXRlLndyaXRlIiwiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQuZGF0YS1leHBvcnQucmVhZCIsImRveC14c3VhYS1zdGQtdHJpYWwhYjEwODQ0LmNsaWVudC5yZWFkIiwiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQuZG9jdW1lbnQucmVhZCIsImRveC14c3VhYS1zdGQtdHJpYWwhYjEwODQ0LmRhdGEtZXhwb3J0LndyaXRlIiwiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQuZGF0YS53cml0ZSIsImRveC14c3VhYS1zdGQtdHJpYWwhYjEwODQ0LmlkZW50aWZpZXIud3JpdGUiLCJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NC50cmFpbmluZy1kYXRhLndyaXRlIiwiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQuc2NoZW1hLnJlYWQiLCJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NC50ZWNobmljYWxzY29wZSIsImRveC14c3VhYS1zdGQtdHJpYWwhYjEwODQ0LmNsaWVudC53cml0ZSIsImRveC14c3VhYS1zdGQtdHJpYWwhYjEwODQ0LmNvbmZpZy5yZWFkIiwiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQuY2FwYWJpbGl0aWVzLnJlYWQiLCJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NC5kYXRhLnJlYWQiLCJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NC5jb25maWcud3JpdGUiLCJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NC50cmFpbmluZy1kYXRhLnJlYWQiXSwic2NvcGUiOlsiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQuc2NoZW1hLndyaXRlIiwiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQuaWRlbnRpZmllci5yZWFkIiwiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQuZG9jdW1lbnQud3JpdGUiLCJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NC50ZW1wbGF0ZS5yZWFkIiwidWFhLnJlc291cmNlIiwiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQucnVsZXMud3JpdGUiLCJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NC50ZW1wbGF0ZS53cml0ZSIsImRveC14c3VhYS1zdGQtdHJpYWwhYjEwODQ0LmRhdGEtZXhwb3J0LnJlYWQiLCJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NC5jbGllbnQucmVhZCIsImRveC14c3VhYS1zdGQtdHJpYWwhYjEwODQ0LmRvY3VtZW50LnJlYWQiLCJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NC5kYXRhLWV4cG9ydC53cml0ZSIsImRveC14c3VhYS1zdGQtdHJpYWwhYjEwODQ0LmRhdGEud3JpdGUiLCJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NC5pZGVudGlmaWVyLndyaXRlIiwiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQudHJhaW5pbmctZGF0YS53cml0ZSIsImRveC14c3VhYS1zdGQtdHJpYWwhYjEwODQ0LnNjaGVtYS5yZWFkIiwiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQudGVjaG5pY2Fsc2NvcGUiLCJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NC5jbGllbnQud3JpdGUiLCJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NC5jb25maWcucmVhZCIsImRveC14c3VhYS1zdGQtdHJpYWwhYjEwODQ0LmNhcGFiaWxpdGllcy5yZWFkIiwiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQuZGF0YS5yZWFkIiwiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQuY29uZmlnLndyaXRlIiwiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQudHJhaW5pbmctZGF0YS5yZWFkIl0sImNsaWVudF9pZCI6InNiLWU1YTRlZjhkLWYxY2MtNDA0OS1iNGNhLTY1YWY4NTIwOTU2YSFiMTY1MDMwfGRveC14c3VhYS1zdGQtdHJpYWwhYjEwODQ0IiwiY2lkIjoic2ItZTVhNGVmOGQtZjFjYy00MDQ5LWI0Y2EtNjVhZjg1MjA5NTZhIWIxNjUwMzB8ZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQiLCJhenAiOiJzYi1lNWE0ZWY4ZC1mMWNjLTQwNDktYjRjYS02NWFmODUyMDk1NmEhYjE2NTAzMHxkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NCIsImdyYW50X3R5cGUiOiJjbGllbnRfY3JlZGVudGlhbHMiLCJyZXZfc2lnIjoiNjE4NzQ4MzIiLCJpYXQiOjE2OTM4NDE4NzksImV4cCI6MTY5Mzg4NTA3OSwiaXNzIjoiaHR0cHM6Ly9iMTNiNTY2YXRyaWFsLmF1dGhlbnRpY2F0aW9uLnVzMTAuaGFuYS5vbmRlbWFuZC5jb20vb2F1dGgvdG9rZW4iLCJ6aWQiOiJmOTY3YzBmNS0yZTg5LTQ2NTktOTBhMi05NDZkN2YwYmNlZDYiLCJhdWQiOlsiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQuc2NoZW1hIiwiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQuY2FwYWJpbGl0aWVzIiwic2ItZTVhNGVmOGQtZjFjYy00MDQ5LWI0Y2EtNjVhZjg1MjA5NTZhIWIxNjUwMzB8ZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQiLCJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NC5kb2N1bWVudCIsImRveC14c3VhYS1zdGQtdHJpYWwhYjEwODQ0LnRlbXBsYXRlIiwiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQuZGF0YSIsImRveC14c3VhYS1zdGQtdHJpYWwhYjEwODQ0LnRyYWluaW5nLWRhdGEiLCJ1YWEiLCJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NCIsImRveC14c3VhYS1zdGQtdHJpYWwhYjEwODQ0LmNsaWVudCIsImRveC14c3VhYS1zdGQtdHJpYWwhYjEwODQ0LmRhdGEtZXhwb3J0IiwiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQucnVsZXMiLCJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NC5pZGVudGlmaWVyIiwiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQuY29uZmlnIl19.u9FgDhPHbiIPhsBmcrSQIZteTD_Ru-7XAC9aJBejGj3Y4lSQ3unR_Xr1fV1J_yp1OnsbC8Xj1yHqcSRM2KM8AiWNJHG7-19d1xAVYsMeu0SzETKIvC6Gou72Onkm02eI9SrZe47pQ5r07TOk8mu-3bb5p_npMKcnxrnfq7Ln5w_hkWblwzkM9kmAcwz7DkrE0chPuDEFzNJikNhU3ng5jdqNdslFA-jtUeeH4Mcg-WA0vlA_gCLmzIUAyyersv60HISyywZ6LLBoo5qX0FRZBvpziEcVAHbFdiwLjsFNzIh0K5d9aDeeh30icjUTBK_9aK8gol2AuOo3TsEIt2s8Ig";
               var header= {
                "Authorization": "Bearer " + authToken
            }; */
               
               var successcallback = function(data) {
                // This is the success callback function
                console.log("AJAX request was successful:", data);
                var responseData = JSON.parse(data);
                this._jobId = responseData.id;
                // Process the data returned from the server
            };
            var failcallback = function(error) {
                // This is the error callback function
                console.error(error.responseText);
                console.error("AJAX request failed:", error);
                // Handle the error case
            };   
            var ajaxRequest = {};
            ajaxRequest.url = dieUrl;
            ajaxRequest.method = "POST";
            //ajaxRequest.headers = header;
            ajaxRequest.data = formData;
            ajaxRequest.processData = false;
            ajaxRequest.contentType = false;
            ajaxRequest.mimeType = "multipart/form-data";
            ajaxRequest.success = successcallback.bind(this);
            ajaxRequest.error = failcallback.bind(this);
            jQuery.ajax(ajaxRequest);
            },
          
            onRefresh: function() {
                this.getView().getModel("viewModel").setProperty("/refreshEnabled", true);
                var dieUrl = this._getbaseUrl() + "/document/jobs/"  + this._jobId;
                /* var authToken = "eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vYjEzYjU2NmF0cmlhbC5hdXRoZW50aWNhdGlvbi51czEwLmhhbmEub25kZW1hbmQuY29tL3Rva2VuX2tleXMiLCJraWQiOiJkZWZhdWx0LWp3dC1rZXktMjg1MTg0NzU5IiwidHlwIjoiSldUIiwiamlkIjogIk9vRStRL1BPeHRzcllYbTZzNnRQMitzc2VhM3BIZG5PTmwyMjlsN1FjUlk9In0.eyJqdGkiOiJiYzY5NmE1Y2FkZDE0NjE2YjE4MDVmYjgxZmU2YzBhOSIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiJmOTY3YzBmNS0yZTg5LTQ2NTktOTBhMi05NDZkN2YwYmNlZDYiLCJ6ZG4iOiJiMTNiNTY2YXRyaWFsIiwic2VydmljZWluc3RhbmNlaWQiOiJlNWE0ZWY4ZC1mMWNjLTQwNDktYjRjYS02NWFmODUyMDk1NmEifSwic3ViIjoic2ItZTVhNGVmOGQtZjFjYy00MDQ5LWI0Y2EtNjVhZjg1MjA5NTZhIWIxNjUwMzB8ZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQiLCJhdXRob3JpdGllcyI6WyJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NC5zY2hlbWEud3JpdGUiLCJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NC5pZGVudGlmaWVyLnJlYWQiLCJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NC5kb2N1bWVudC53cml0ZSIsImRveC14c3VhYS1zdGQtdHJpYWwhYjEwODQ0LnRlbXBsYXRlLnJlYWQiLCJ1YWEucmVzb3VyY2UiLCJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NC5ydWxlcy53cml0ZSIsImRveC14c3VhYS1zdGQtdHJpYWwhYjEwODQ0LnRlbXBsYXRlLndyaXRlIiwiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQuZGF0YS1leHBvcnQucmVhZCIsImRveC14c3VhYS1zdGQtdHJpYWwhYjEwODQ0LmNsaWVudC5yZWFkIiwiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQuZG9jdW1lbnQucmVhZCIsImRveC14c3VhYS1zdGQtdHJpYWwhYjEwODQ0LmRhdGEtZXhwb3J0LndyaXRlIiwiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQuZGF0YS53cml0ZSIsImRveC14c3VhYS1zdGQtdHJpYWwhYjEwODQ0LmlkZW50aWZpZXIud3JpdGUiLCJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NC50cmFpbmluZy1kYXRhLndyaXRlIiwiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQuc2NoZW1hLnJlYWQiLCJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NC50ZWNobmljYWxzY29wZSIsImRveC14c3VhYS1zdGQtdHJpYWwhYjEwODQ0LmNsaWVudC53cml0ZSIsImRveC14c3VhYS1zdGQtdHJpYWwhYjEwODQ0LmNvbmZpZy5yZWFkIiwiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQuY2FwYWJpbGl0aWVzLnJlYWQiLCJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NC5kYXRhLnJlYWQiLCJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NC5jb25maWcud3JpdGUiLCJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NC50cmFpbmluZy1kYXRhLnJlYWQiXSwic2NvcGUiOlsiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQuc2NoZW1hLndyaXRlIiwiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQuaWRlbnRpZmllci5yZWFkIiwiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQuZG9jdW1lbnQud3JpdGUiLCJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NC50ZW1wbGF0ZS5yZWFkIiwidWFhLnJlc291cmNlIiwiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQucnVsZXMud3JpdGUiLCJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NC50ZW1wbGF0ZS53cml0ZSIsImRveC14c3VhYS1zdGQtdHJpYWwhYjEwODQ0LmRhdGEtZXhwb3J0LnJlYWQiLCJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NC5jbGllbnQucmVhZCIsImRveC14c3VhYS1zdGQtdHJpYWwhYjEwODQ0LmRvY3VtZW50LnJlYWQiLCJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NC5kYXRhLWV4cG9ydC53cml0ZSIsImRveC14c3VhYS1zdGQtdHJpYWwhYjEwODQ0LmRhdGEud3JpdGUiLCJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NC5pZGVudGlmaWVyLndyaXRlIiwiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQudHJhaW5pbmctZGF0YS53cml0ZSIsImRveC14c3VhYS1zdGQtdHJpYWwhYjEwODQ0LnNjaGVtYS5yZWFkIiwiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQudGVjaG5pY2Fsc2NvcGUiLCJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NC5jbGllbnQud3JpdGUiLCJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NC5jb25maWcucmVhZCIsImRveC14c3VhYS1zdGQtdHJpYWwhYjEwODQ0LmNhcGFiaWxpdGllcy5yZWFkIiwiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQuZGF0YS5yZWFkIiwiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQuY29uZmlnLndyaXRlIiwiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQudHJhaW5pbmctZGF0YS5yZWFkIl0sImNsaWVudF9pZCI6InNiLWU1YTRlZjhkLWYxY2MtNDA0OS1iNGNhLTY1YWY4NTIwOTU2YSFiMTY1MDMwfGRveC14c3VhYS1zdGQtdHJpYWwhYjEwODQ0IiwiY2lkIjoic2ItZTVhNGVmOGQtZjFjYy00MDQ5LWI0Y2EtNjVhZjg1MjA5NTZhIWIxNjUwMzB8ZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQiLCJhenAiOiJzYi1lNWE0ZWY4ZC1mMWNjLTQwNDktYjRjYS02NWFmODUyMDk1NmEhYjE2NTAzMHxkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NCIsImdyYW50X3R5cGUiOiJjbGllbnRfY3JlZGVudGlhbHMiLCJyZXZfc2lnIjoiNjE4NzQ4MzIiLCJpYXQiOjE2OTM4NDE4NzksImV4cCI6MTY5Mzg4NTA3OSwiaXNzIjoiaHR0cHM6Ly9iMTNiNTY2YXRyaWFsLmF1dGhlbnRpY2F0aW9uLnVzMTAuaGFuYS5vbmRlbWFuZC5jb20vb2F1dGgvdG9rZW4iLCJ6aWQiOiJmOTY3YzBmNS0yZTg5LTQ2NTktOTBhMi05NDZkN2YwYmNlZDYiLCJhdWQiOlsiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQuc2NoZW1hIiwiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQuY2FwYWJpbGl0aWVzIiwic2ItZTVhNGVmOGQtZjFjYy00MDQ5LWI0Y2EtNjVhZjg1MjA5NTZhIWIxNjUwMzB8ZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQiLCJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NC5kb2N1bWVudCIsImRveC14c3VhYS1zdGQtdHJpYWwhYjEwODQ0LnRlbXBsYXRlIiwiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQuZGF0YSIsImRveC14c3VhYS1zdGQtdHJpYWwhYjEwODQ0LnRyYWluaW5nLWRhdGEiLCJ1YWEiLCJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NCIsImRveC14c3VhYS1zdGQtdHJpYWwhYjEwODQ0LmNsaWVudCIsImRveC14c3VhYS1zdGQtdHJpYWwhYjEwODQ0LmRhdGEtZXhwb3J0IiwiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQucnVsZXMiLCJkb3gteHN1YWEtc3RkLXRyaWFsIWIxMDg0NC5pZGVudGlmaWVyIiwiZG94LXhzdWFhLXN0ZC10cmlhbCFiMTA4NDQuY29uZmlnIl19.u9FgDhPHbiIPhsBmcrSQIZteTD_Ru-7XAC9aJBejGj3Y4lSQ3unR_Xr1fV1J_yp1OnsbC8Xj1yHqcSRM2KM8AiWNJHG7-19d1xAVYsMeu0SzETKIvC6Gou72Onkm02eI9SrZe47pQ5r07TOk8mu-3bb5p_npMKcnxrnfq7Ln5w_hkWblwzkM9kmAcwz7DkrE0chPuDEFzNJikNhU3ng5jdqNdslFA-jtUeeH4Mcg-WA0vlA_gCLmzIUAyyersv60HISyywZ6LLBoo5qX0FRZBvpziEcVAHbFdiwLjsFNzIh0K5d9aDeeh30icjUTBK_9aK8gol2AuOo3TsEIt2s8Ig";
                 var header= {
                "Authorization": "Bearer " + authToken
            }; */
                var successcallback = function(data) {
                    // This is the success callback function
                    console.log("AJAX request was successful:", data);
                    var response = JSON.parse(data);
                    if (response.status === "DONE") {
                        this._setInvoiceData(response.extraction)
                        var viewModel = this.getView().getModel("viewModel");
                        viewModel.setProperty("/refreshEnabled", false);
                        viewModel.setProperty("/visibleEnabled", false);
                        viewModel.setProperty("/editable", true);
            
                    } else if (response.status === "PENDING") {
                        var sText=this.getView().getModel("i18n").getResourceBundle().getText("pendingText");
                        MessageToast.show(sText);
                    }
                    // Process the data returned from the server
                };
                var failcallback = function(error) {
                    // This is the error callback function
                    console.error(error.responseText);
                    console.error("AJAX request failed:", error);
                    // Handle the error case
                };   
                var ajaxRequest = {};
            ajaxRequest.url = dieUrl;
            ajaxRequest.method = "GET";
            //ajaxRequest.headers = header;
            ajaxRequest.processData = false;
            ajaxRequest.contentType = false;
            ajaxRequest.mimeType = "multipart/form-data";
            ajaxRequest.success = successcallback.bind(this);
            ajaxRequest.error = failcallback.bind(this);
            jQuery.ajax(ajaxRequest);
                
                
            },
            _setInvoiceData:function(extractedData) {
                var invoice = {}
                //set header
                var invoiceHeader = (extractedData.headerFields).reduce((acc, curr) => {
                    acc[curr.name] = curr.value
                    return acc
                }, {})
        
                //set items
                var invoiceItems = (extractedData.lineItems).reduce((acc, item) => {
                    const lineItem = item.reduce((acc, curr) => {
                        acc[curr.name] = curr.value
                        return acc
                    }, {})
                    acc.push(lineItem)
                    return acc
                }, [])
        
                invoice["header"] = invoiceHeader;
                invoice["items"] = invoiceItems;
        
                this.getView().getModel("invoice").setData(invoice)
            }
        

        });
    });
