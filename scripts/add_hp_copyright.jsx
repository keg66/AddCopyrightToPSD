/*
 * Add HP copyright group to a copied PSD.
 *
 * v1:
 * - Duplicates the active saved PSD to *_HP.psd.
 * - Copies the "クレジット白" layer group from a configured template PSD.
 * - Resizes and places it at the bottom-right 4% safe margin.
 */

#target photoshop

(function () {
    var CREDIT_GROUP_NAME = "クレジット白";
    var CONFIG_FOLDER_NAME = "PhotoshopHpCopyright";
    var CONFIG_FILE_NAME = "config.txt";

    var originalRulerUnits = app.preferences.rulerUnits;
    var templateDoc = null;
    var hpDoc = null;
    var hpDocSavedSuccessfully = false;

    try {
        app.preferences.rulerUnits = Units.PIXELS;

        if (app.documents.length < 1) {
            alert("Photoshopで対象PSDを開いてから実行してください。");
            return;
        }

        var originalDoc = app.activeDocument;
        validateSourceDocument(originalDoc);

        var outputFile = chooseOutputFile(originalDoc);
        if (outputFile === null) {
            return;
        }

        var templateFile = getTemplateFile();
        if (templateFile === null) {
            return;
        }

        templateDoc = app.open(templateFile);
        var templateGroup = findLayerSetByName(templateDoc, CREDIT_GROUP_NAME);
        if (templateGroup === null) {
            throw new Error("テンプレートPSD内に「" + CREDIT_GROUP_NAME + "」グループが見つかりません。");
        }

        hpDoc = duplicateSourceDocument(originalDoc, outputFile);
        app.activeDocument = templateDoc;
        var copiedGroup = templateGroup.duplicate(hpDoc, ElementPlacement.PLACEATBEGINNING);
        app.activeDocument = hpDoc;
        copiedGroup.move(hpDoc, ElementPlacement.PLACEATBEGINNING);

        resizeAndPlaceCreditGroup(hpDoc, copiedGroup);
        savePsd(hpDoc, outputFile);
        hpDocSavedSuccessfully = true;

        if (templateDoc !== null) {
            app.activeDocument = templateDoc;
            templateDoc.close(SaveOptions.DONOTSAVECHANGES);
            templateDoc = null;
        }

        app.activeDocument = hpDoc;
        alert("HP掲載用PSDを作成しました。\n" + outputFile.fsName);
    } catch (e) {
        if (templateDoc !== null) {
            try {
                app.activeDocument = templateDoc;
                templateDoc.close(SaveOptions.DONOTSAVECHANGES);
            } catch (closeError) {
            }
        }

        if (hpDoc !== null) {
            try {
                if (!hpDocSavedSuccessfully) {
                    app.activeDocument = hpDoc;
                    hpDoc.close(SaveOptions.DONOTSAVECHANGES);
                }
            } catch (hpCloseError) {
            }
        }

        alert("処理を中止しました。\n\n" + e.message);
    } finally {
        app.preferences.rulerUnits = originalRulerUnits;
    }

    function validateSourceDocument(doc) {
        var sourceFile;

        try {
            sourceFile = File(doc.fullName);
        } catch (e) {
            throw new Error("対象PSDが保存されていません。先に元PSDを保存してください。");
        }

        var ext = getExtension(sourceFile.name).toLowerCase();
        if (ext !== "psd") {
            throw new Error("対象は保存済みPSDファイルにしてください。");
        }

        if (!doc.saved) {
            throw new Error("未保存変更があります。先に元PSDを保存してください。");
        }
    }

    function chooseOutputFile(sourceDoc) {
        var sourceFile = File(sourceDoc.fullName);
        var parentFolder = sourceFile.parent;
        var baseName = getBaseName(sourceFile.name);
        var outputFile = File(parentFolder.fsName + "/" + baseName + "_HP.psd");

        if (!outputFile.exists) {
            return outputFile;
        }

        var choice = showExistingOutputDialog(outputFile);
        if (choice === "cancel") {
            return null;
        }

        if (choice === "overwrite") {
            if (isFileOpenInPhotoshop(outputFile)) {
                throw new Error(outputFile.name + " がPhotoshopで開かれています。閉じてから再実行してください。");
            }
            return outputFile;
        }

        return findNumberedOutputFile(parentFolder, baseName);
    }

    function showExistingOutputDialog(outputFile) {
        var result = "cancel";
        var dialog = new Window("dialog", "出力PSDが既に存在します");
        dialog.orientation = "column";
        dialog.alignChildren = "fill";
        dialog.margins = 16;

        dialog.add("statictext", undefined, outputFile.fsName + "\n\nこのファイルは既に存在します。", { multiline: true });

        var buttons = dialog.add("group");
        buttons.orientation = "row";
        buttons.alignment = "right";

        var overwriteButton = buttons.add("button", undefined, "上書きする");
        var renameButton = buttons.add("button", undefined, "別名で保存する");
        var cancelButton = buttons.add("button", undefined, "キャンセル");

        overwriteButton.onClick = function () {
            result = "overwrite";
            dialog.close();
        };
        renameButton.onClick = function () {
            result = "rename";
            dialog.close();
        };
        cancelButton.onClick = function () {
            result = "cancel";
            dialog.close();
        };

        dialog.show();
        return result;
    }

    function findNumberedOutputFile(parentFolder, baseName) {
        var index = 2;
        var candidate;
        while (true) {
            candidate = File(parentFolder.fsName + "/" + baseName + "_HP_" + index + ".psd");
            if (!candidate.exists && !isFileOpenInPhotoshop(candidate)) {
                return candidate;
            }
            index++;
        }
    }

    function getTemplateFile() {
        var configFile = getConfigFile();
        var templatePath = readTextFile(configFile);
        var templateFile = null;

        if (templatePath !== "") {
            templateFile = File(templatePath);
            if (templateFile.exists) {
                return templateFile;
            }
        }

        templateFile = File.openDialog("クレジット用テンプレートPSDを選択してください", "PSD:*.psd");
        if (templateFile === null) {
            alert("テンプレートPSDが選択されなかったため、処理を中止します。");
            return null;
        }

        writeTextFile(configFile, templateFile.fsName);
        return templateFile;
    }

    function getConfigFile() {
        var configFolder = Folder(Folder.userData + "/" + CONFIG_FOLDER_NAME);
        if (!configFolder.exists) {
            if (!configFolder.create()) {
                throw new Error("設定フォルダを作成できませんでした。\n" + configFolder.fsName);
            }
        }
        return File(configFolder.fsName + "/" + CONFIG_FILE_NAME);
    }

    function readTextFile(file) {
        if (!file.exists) {
            return "";
        }

        file.encoding = "UTF-8";
        if (!file.open("r")) {
            throw new Error("設定ファイルを読み込めませんでした。\n" + file.fsName);
        }

        var text = file.read();
        file.close();
        return trimText(text);
    }

    function writeTextFile(file, text) {
        file.encoding = "UTF-8";
        if (!file.open("w")) {
            throw new Error("設定ファイルを書き込めませんでした。\n" + file.fsName);
        }
        file.write(text);
        file.close();
    }

    function duplicateSourceDocument(sourceDoc, outputFile) {
        app.activeDocument = sourceDoc;
        var hpName = getBaseName(outputFile.name);
        return sourceDoc.duplicate(hpName, false);
    }

    function savePsd(doc, outputFile) {
        var options = new PhotoshopSaveOptions();
        options.alphaChannels = true;
        options.annotations = true;
        options.embedColorProfile = true;
        options.layers = true;
        options.spotColors = true;

        app.activeDocument = doc;
        doc.saveAs(outputFile, options, false, Extension.LOWERCASE);
    }

    function findLayerSetByName(container, layerSetName) {
        var i;
        var found;

        for (i = 0; i < container.layerSets.length; i++) {
            if (container.layerSets[i].name === layerSetName) {
                return container.layerSets[i];
            }

            found = findLayerSetByName(container.layerSets[i], layerSetName);
            if (found !== null) {
                return found;
            }
        }

        return null;
    }

    function resizeAndPlaceCreditGroup(doc, group) {
        var width = px(doc.width);
        var height = px(doc.height);
        var bounds = getBounds(group);
        var groupWidth = bounds.right - bounds.left;
        var groupHeight = bounds.bottom - bounds.top;
        var scalePercent;

        if (groupWidth <= 0 || groupHeight <= 0) {
            throw new Error("クレジットグループのサイズを取得できませんでした。");
        }

        if (height >= width) {
            scalePercent = ((width * 0.25) / groupWidth) * 100;
        } else {
            scalePercent = ((height * 0.0625) / groupHeight) * 100;
        }

        group.resize(scalePercent, scalePercent, AnchorPosition.MIDDLECENTER);

        bounds = getBounds(group);
        var rightEdge = width * 0.96;
        var bottomEdge = height * 0.96;
        var dx = rightEdge - bounds.right;
        var dy = bottomEdge - bounds.bottom;
        group.translate(dx, dy);
    }

    function getBounds(layerOrGroup) {
        var b = layerOrGroup.bounds;
        return {
            left: px(b[0]),
            top: px(b[1]),
            right: px(b[2]),
            bottom: px(b[3])
        };
    }

    function px(value) {
        if (value === null || value === undefined) {
            return 0;
        }

        if (typeof value.as === "function") {
            return value.as("px");
        }

        return Number(value);
    }

    function isFileOpenInPhotoshop(file) {
        var targetPath = normalizePath(file);
        var i;
        var docFile;

        for (i = 0; i < app.documents.length; i++) {
            try {
                docFile = File(app.documents[i].fullName);
                if (normalizePath(docFile) === targetPath) {
                    return true;
                }
            } catch (e) {
            }
        }

        return false;
    }

    function normalizePath(file) {
        return File(file).fsName.toLowerCase();
    }

    function getBaseName(fileName) {
        var dotIndex = fileName.lastIndexOf(".");
        if (dotIndex < 0) {
            return fileName;
        }
        return fileName.substring(0, dotIndex);
    }

    function getExtension(fileName) {
        var dotIndex = fileName.lastIndexOf(".");
        if (dotIndex < 0) {
            return "";
        }
        return fileName.substring(dotIndex + 1);
    }

    function trimText(text) {
        return String(text).replace(/^\s+|\s+$/g, "");
    }
}());
