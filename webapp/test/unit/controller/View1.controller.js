/*global QUnit*/

sap.ui.define([
    "sap/ui/thirdparty/sinon",
    "sap/ui/thirdparty/sinon-qunit",
    "sap/ui/model/json/JSONModel", // Add this dependency
    "sapbtp/pdfupload/controller/View1.controller"
], function (sinon, sinonQUnit, JSONModel, Controller) {
    "use strict";

    QUnit.module("View1 Controller", {
        beforeEach: function () {
            // Prepare your setup before each test here
            this.oAppController = new Controller();

            // Create a stub for the getView function
            this.oStubGetView = sinon.stub(this.oAppController, "getView");

            // Create a mock view with a getModel function
            var oMockView = {
                getModel: function () {
                    return new JSONModel({
                        editable: false,
                        visibleEnabled: false,
                        refreshEnabled: false,
                        uploadEnabled: false
                    });
                }
            };

            // Configure the stub to return the mock view
            this.oStubGetView.returns(oMockView);
        },
        afterEach: function () {
            // Clean up after each test here
            this.oStubGetView.restore();
            this.oAppController.destroy();
        }
    });

    QUnit.test("I should test the View1 controller", function (assert) {
        var oAppController = new Controller();
        oAppController.onInit();
        assert.ok(oAppController);
    });

    QUnit.test("onAfterRendering should set the viewModel", function (assert) {
        // Arrange - Already done in beforeEach

        // Act
        this.oAppController.onAfterRendering();

        // Assert - Check if the viewModel is set correctly
        var oViewModel = this.oAppController.getView().getModel("viewModel");
        assert.ok(oViewModel, "viewModel is set");

        // Check if the viewModel properties are set as expected
        assert.strictEqual(oViewModel.getProperty("/editable"), false, "editable property is set to false");
        assert.strictEqual(oViewModel.getProperty("/visibleEnabled"), false, "visibleEnabled property is set to false");
        assert.strictEqual(oViewModel.getProperty("/refreshEnabled"), false, "refreshEnabled property is set to false");
        assert.strictEqual(oViewModel.getProperty("/uploadEnabled"), false, "uploadEnabled property is set to false");
    });

});
