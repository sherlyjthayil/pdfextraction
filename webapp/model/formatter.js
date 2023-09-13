sap.ui.define([], function () {
    "use strict"
    return {
        statusText: function (sStatus) {
            var resourceBundle = this.getView().getModel("i18n").getResourceBundle();
            switch (sStatus) {
                case "USD":
                    return resourceBundle.getText("invoiceStatusA");
                case "AUD":
                    return resourceBundle.getText("invoiceStatusB");
                default:
                    return sStatus;
            }
        }
    }
})