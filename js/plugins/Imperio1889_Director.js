//=============================================================================
// Imperio1889_Director.js (v3.5 - Jornada do Herói em 12 Estágios & Rigor Histórico 1889)
// Diretor Cinematográfico 16:9, Tela de Título Imperial com Chuva e Luz a Gás,
// Rastreador dos 12 Estágios da Jornada do Herói (Joseph Campbell),
// Slides de Prólogo com Ken Burns e HUD Histórico da Rua do Ouvidor
//=============================================================================

/*:
 * @plugindesc v3.5 Jornada do Herói (12 Estágios), Menu Imperial 1889, Diretor 16:9 e HUD Histórico (1889: O Último Império)
 * @author Equipe 1889: O Último Império
 *
 * @help
 * Comandos de Plugin disponíveis nos Eventos:
 *   1889_CINEMA ON                - Ativa barras widescreen 2.39:1 de cinema
 *   1889_CINEMA OFF               - Desativa barras widescreen 2.39:1
 *   1889_ZOOM 1.25 40             - Zoom suave focado no personagem sem cortar bordas
 *   1889_ZOOM_RESET 40            - Restaura zoom 1.0x em N frames
 *   1889_CARTELA Titulo | Sub     - Exibe cartela histórica dourada auto-ajustada
 *   1889_SLIDE NomeDaImagem       - Exibe pintura 16:9 em tela cheia (img/pictures/) com Ken Burns
 *   1889_SLIDE OFF                - Oculta o slide cinematográfico com fade suave
 *   1889_JORNADA <1..12>          - Define o Estágio atual da Jornada do Herói (Var #3)
 */

(function() {
    'use strict';

    var TARGET_W = 1280;
    var TARGET_H = 720;

    SceneManager._screenWidth  = TARGET_W;
    SceneManager._screenHeight = TARGET_H;
    SceneManager._boxWidth     = TARGET_W;
    SceneManager._boxHeight    = TARGET_H;

    // Os 12 Estágios Clássicos da Jornada do Herói (Joseph Campbell / Vogler) em 1889
    var HERO_STAGES = [
        "",
        "I. O Mundo Comum (Pequena África & Cais do Valongo)",
        "II. O Chamado à Aventura (A Farsa de 14 de Novembro)",
        "III. A Recusa do Chamado (O Dilema do Capoeira)",
        "IV. Encontro com o Mentor (André Rebouças n'A Cidade do Rio)",
        "V. Travessia do 1º Limiar (Rua do Ouvidor Sitiada)",
        "VI. Testes, Aliados e Inimigos (Redações d'O Paiz e Diário)",
        "VII. Aproximação da Caverna Oculta (O 3º Telegrama e Floriano)",
        "VIII. A Provação Suprema (Duelo contra Coronel Valadares)",
        "IX. A Recompensa (A Lista Negra de Sampaio Ferraz)",
        "X. O Caminho de Volta (O Tiro no Barão do Ladário)",
        "XI. A Ressurreição (Fogo nos Arquivos da Deportação)",
        "XII. O Retorno com o Elixir (A Roda Eterna da Liberdade)"
    ];

    var _SceneManager_initNwjs = SceneManager.initNwjs;
    SceneManager.initNwjs = function() {
        _SceneManager_initNwjs.call(this);
        if (Utils.isNwjs()) {
            var dw = TARGET_W - window.innerWidth;
            var dh = TARGET_H - window.innerHeight;
            if (dw !== 0 || dh !== 0) {
                window.moveBy(-dw / 2, -dh / 2);
                window.resizeBy(dw, dh);
            }
        }
    };

    Window_Base.prototype.standardBackOpacity = function() {
        return 232;
    };

    var _Window_Base_initialize = Window_Base.prototype.initialize;
    Window_Base.prototype.initialize = function(x, y, width, height) {
        _Window_Base_initialize.call(this, x, y, width, height);
        this.setTone(18, -4, -22);
    };

    //-------------------------------------------------------------------------
    // TELA DE TÍTULO PROFISSIONAL DE 1889 (Scene_Title + Window_TitleCommand)
    //-------------------------------------------------------------------------
    function Sprite_ImperioTitleOverlay() {
        this.initialize.apply(this, arguments);
    }

    Sprite_ImperioTitleOverlay.prototype = Object.create(Sprite.prototype);
    Sprite_ImperioTitleOverlay.prototype.constructor = Sprite_ImperioTitleOverlay;

    Sprite_ImperioTitleOverlay.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this.bitmap = new Bitmap(Graphics.width, Graphics.height);
        this._tick = 0;
        this._rainDrops = [];
        for (var i = 0; i < 68; i++) {
            this._rainDrops.push({
                x: Math.random() * Graphics.width,
                y: Math.random() * Graphics.height,
                len: 14 + Math.random() * 18,
                speed: 9 + Math.random() * 6,
                alpha: 0.14 + Math.random() * 0.22
            });
        }
    };

    Sprite_ImperioTitleOverlay.prototype.update = function() {
        Sprite.prototype.update.call(this);
        this._tick++;
        for (var i = 0; i < this._rainDrops.length; i++) {
            var d = this._rainDrops[i];
            d.x -= d.speed * 0.22;
            d.y += d.speed;
            if (d.y > Graphics.height) {
                d.y = -20;
                d.x = Math.random() * (Graphics.width + 120);
            }
        }
        if (this._tick % 2 === 0) {
            this.redrawTitleScreen();
        }
    };

    Sprite_ImperioTitleOverlay.prototype.redrawTitleScreen = function() {
        var bmp = this.bitmap;
        var ctx = bmp.context;
        var w = Graphics.width;
        var h = Graphics.height;
        bmp.clear();

        ctx.save();

        var pulse = 0.5 + 0.5 * Math.sin(this._tick * 0.04);
        var gradLeft = ctx.createLinearGradient(0, 0, 680, 0);
        gradLeft.addColorStop(0.0, 'rgba(6, 5, 4, 0.86)');
        gradLeft.addColorStop(0.65, 'rgba(10, 8, 6, 0.45)');
        gradLeft.addColorStop(1.0, 'rgba(10, 8, 6, 0.0)');
        ctx.fillStyle = gradLeft;
        ctx.fillRect(0, 0, 680, h);

        var glowGrad = ctx.createRadialGradient(w * 0.62, h * 0.34, 20, w * 0.62, h * 0.34, 420);
        glowGrad.addColorStop(0.0, 'rgba(255, 195, 85, ' + (0.10 + pulse * 0.06).toFixed(3) + ')');
        glowGrad.addColorStop(0.6, 'rgba(212, 140, 40, 0.04)');
        glowGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, w, h);

        ctx.lineWidth = 1.2;
        for (var i = 0; i < this._rainDrops.length; i++) {
            var d = this._rainDrops[i];
            ctx.strokeStyle = 'rgba(225, 215, 195, ' + d.alpha.toFixed(2) + ')';
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(d.x - d.len * 0.22, d.y + d.len);
            ctx.stroke();
        }

        ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
        ctx.lineWidth = 2;
        ctx.strokeRect(16, 16, w - 32, h - 32);
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.22)';
        ctx.lineWidth = 1;
        ctx.strokeRect(22, 22, w - 44, h - 44);

        var px = 56;
        var py = 54;
        var pw = 640;
        var ph = 225;

        var panelGrad = ctx.createLinearGradient(px, py, px + pw, py + ph);
        panelGrad.addColorStop(0.0, 'rgba(12, 9, 7, 0.90)');
        panelGrad.addColorStop(0.85, 'rgba(20, 14, 11, 0.78)');
        panelGrad.addColorStop(1.0, 'rgba(20, 14, 11, 0.15)');
        ctx.fillStyle = panelGrad;
        ctx.fillRect(px, py, pw, ph);

        ctx.fillStyle = '#d4af37';
        ctx.fillRect(px, py, pw - 60, 2);
        ctx.fillRect(px, py + ph - 2, pw - 60, 2);
        ctx.fillRect(px, py, 4, ph);

        ctx.fillStyle = '#9b1c1c';
        ctx.fillRect(px + 6, py + 6, 3, ph - 12);

        bmp.fontFace = 'Georgia, "Times New Roman", serif';
        bmp.fontSize = 15;
        bmp.textColor = '#e6c265';
        bmp.outlineColor = 'rgba(0, 0, 0, 0.95)';
        bmp.outlineWidth = 4;
        bmp.drawText('✦   RIO DE JANEIRO  •  14 DE NOVEMBRO DE 1889   ✦', px + 24, py + 16, pw - 40, 24, 'left');

        bmp.fontSize = 64;
        bmp.textColor = '#f7dc88';
        bmp.outlineColor = '#140c06';
        bmp.outlineWidth = 7;
        bmp.drawText('1889', px + 22, py + 44, 210, 68, 'left');

        bmp.fontSize = 36;
        bmp.textColor = '#ffffff';
        bmp.outlineWidth = 6;
        bmp.drawText('O ÚLTIMO IMPÉRIO', px + 195, py + 54, pw - 210, 48, 'left');

        ctx.fillStyle = 'rgba(212, 175, 55, 0.75)';
        ctx.fillRect(px + 24, py + 124, pw - 110, 2);
        ctx.fillStyle = '#c92a2a';
        ctx.fillRect(px + 195, py + 121, 8, 8);

        bmp.fontSize = 18;
        bmp.textColor = '#f0e6d2';
        bmp.outlineWidth = 4;
        bmp.drawText('A Noite da Navalha, a Guarda Negra e a Queda da Coroa', px + 24, py + 136, pw - 48, 28, 'left');

        bmp.fontSize = 14;
        bmp.textColor = '#c8b896';
        bmp.drawText('Protagonizando Bento "Navalha" de Carvalho & Eng. André Rebouças', px + 24, py + 170, pw - 48, 24, 'left');

        ctx.fillStyle = 'rgba(8, 6, 5, 0.86)';
        ctx.fillRect(16, h - 46, w - 32, 30);
        ctx.fillStyle = 'rgba(212, 175, 55, 0.55)';
        ctx.fillRect(16, h - 46, w - 32, 1);

        bmp.fontSize = 13;
        bmp.textColor = '#d8c394';
        bmp.outlineWidth = 3;
        bmp.drawText('EDIÇÃO CINEMATOGRÁFICA 16:9   •   MÚSICA DE ÉPOCA: CHORO CARIOCA, MODINHA IMPERIAL & CAPOEIRA   •   MALTA DOS GUAIAMUS', 24, h - 43, w - 48, 24, 'center');

        ctx.restore();
        bmp._setDirty();
    };

    var _Scene_Title_createForeground = Scene_Title.prototype.createForeground;
    Scene_Title.prototype.createForeground = function() {
        _Scene_Title_createForeground.call(this);
        if (this._gameTitleSprite) {
            this._gameTitleSprite.visible = false;
        }
        this._imperioTitleOverlay = new Sprite_ImperioTitleOverlay();
        var winIdx = this.children.indexOf(this._windowLayer);
        if (winIdx >= 0) {
            this.addChildAt(this._imperioTitleOverlay, winIdx);
        } else {
            this.addChild(this._imperioTitleOverlay);
        }
    };

    var _Scene_Title_start = Scene_Title.prototype.start;
    Scene_Title.prototype.start = function() {
        _Scene_Title_start.call(this);
        this._titlePanTick = 0;
        this._fitTitleSprite1889(this._backSprite1);
        this._fitTitleSprite1889(this._backSprite2);
    };

    Scene_Title.prototype._fitTitleSprite1889 = function(sprite) {
        if (!sprite || !sprite.bitmap) return;
        sprite.bitmap.addLoadListener(function(bmp) {
            if (bmp.width > 0 && bmp.height > 0) {
                sprite.anchor.x = 0.5;
                sprite.anchor.y = 0.5;
                sprite.x = Graphics.width / 2;
                sprite.y = Graphics.height / 2;
                var scaleX = Graphics.width / bmp.width;
                var scaleY = Graphics.height / bmp.height;
                var baseScale = Math.max(scaleX, scaleY);
                sprite._baseScale1889 = baseScale;
                sprite.scale.x = baseScale * 1.02;
                sprite.scale.y = baseScale * 1.02;
            }
        });
    };

    var _Scene_Title_update = Scene_Title.prototype.update;
    Scene_Title.prototype.update = function() {
        _Scene_Title_update.call(this);
        this._titlePanTick = (this._titlePanTick || 0) + 1;
        if (this._backSprite1 && this._backSprite1._baseScale1889) {
            var bScale = this._backSprite1._baseScale1889;
            var breathe = 1.02 + 0.018 * Math.sin(this._titlePanTick * 0.008);
            this._backSprite1.scale.x = bScale * breathe;
            this._backSprite1.scale.y = bScale * breathe;
            this._backSprite1.x = (Graphics.width / 2) + Math.sin(this._titlePanTick * 0.005) * 8;
        }
    };

    Window_TitleCommand.prototype.windowWidth = function() {
        return 390;
    };

    Window_TitleCommand.prototype.updatePlacement = function() {
        this.x = 56;
        this.y = Graphics.boxHeight - this.height - 68;
    };

    Window_TitleCommand.prototype.lineHeight = function() {
        return 46;
    };

    Window_TitleCommand.prototype.standardFontFace = function() {
        return 'Georgia, "Times New Roman", serif';
    };

    Window_TitleCommand.prototype.standardFontSize = function() {
        return 21;
    };

    Window_TitleCommand.prototype.makeCommandList = function() {
        this.addCommand('INICIAR CRÔNICA (1889)', 'newGame');
        this.addCommand('CONTINUAR JORNADA', 'continue', this.isContinueEnabled());
        this.addCommand('OPÇÕES DA CORTE', 'options');
    };

    Window_TitleCommand.prototype.drawItem = function(index) {
        var rect = this.itemRectForText(index);
        var isSelected = (this.index() === index);
        this.resetTextColor();
        this.changePaintOpacity(this.isCommandEnabled(index));

        var bmp = this.contents;
        var bgCol = isSelected ? 'rgba(138, 24, 24, 0.72)' : 'rgba(22, 16, 12, 0.58)';
        var borderCol = isSelected ? '#f4d47c' : 'rgba(212, 175, 55, 0.35)';
        bmp.fillRect(rect.x - 4, rect.y + 3, rect.width + 8, rect.height - 6, bgCol);
        bmp.fillRect(rect.x - 4, rect.y + 3, 4, rect.height - 6, isSelected ? '#f4d47c' : '#9b1c1c');
        bmp.fillRect(rect.x - 4, rect.y + rect.height - 4, rect.width + 8, 1, borderCol);

        bmp.fontFace = 'Georgia, "Times New Roman", serif';
        bmp.fontSize = 20;
        bmp.textColor = isSelected ? '#ffe699' : '#f0e6d2';
        var prefix = isSelected ? '◆  ' : '◇  ';
        this.drawText(prefix + this.commandName(index), rect.x + 10, rect.y, rect.width - 16, 'left');
    };

    var _Window_TitleCommand_select = Window_TitleCommand.prototype.select;
    Window_TitleCommand.prototype.select = function(index) {
        var prev = this.index();
        _Window_TitleCommand_select.call(this, index);
        if (this.index() !== prev && this.contents) {
            this.refresh();
        }
    };

    //-------------------------------------------------------------------------
    // MENU PRINCIPAL IN-GAME TEMÁTICO DE 1889 (Com Estágio da Jornada do Herói)
    //-------------------------------------------------------------------------
    function Window_ImperioMenuHeader() {
        this.initialize.apply(this, arguments);
    }

    Window_ImperioMenuHeader.prototype = Object.create(Window_Base.prototype);
    Window_ImperioMenuHeader.prototype.constructor = Window_ImperioMenuHeader;

    Window_ImperioMenuHeader.prototype.initialize = function() {
        Window_Base.prototype.initialize.call(this, 0, 0, Graphics.boxWidth, 76);
        this.refresh();
    };

    Window_ImperioMenuHeader.prototype.refresh = function() {
        this.contents.clear();
        var w = this.contentsWidth();
        var stageIdx = ($gameVariables && $gameVariables.value(3) > 0) ? $gameVariables.value(3) : 5;
        var stageLabel = HERO_STAGES[stageIdx] || HERO_STAGES[5];

        this.contents.fontFace = 'Georgia, "Times New Roman", serif';
        this.contents.fontSize = 18;
        this.contents.textColor = '#f4d47c';
        this.drawText('✦  JORNADA DO HERÓI — ' + stageLabel.toUpperCase(), 6, 2, w - 12, 'left');

        var tg = $gameVariables ? $gameVariables.value(1) : 0;
        var gd = $gameVariables ? $gameVariables.value(2) : 0;
        var boss = ($gameSwitches && $gameSwitches.value(6));
        this.contents.fontSize = 15;
        this.contents.textColor = boss ? '#8ce89b' : '#e6dcc8';
        var statusTxt = boss
            ? '★ Estágio XII Alcançado: Lista de Sampaio Ferraz Destruída!'
            : ('Despachos de Solón/Valadares: ' + tg + '/3   •   Rondas Vencidas: ' + gd + '/3');
        this.drawText(statusTxt, 6, 4, w - 12, 'right');
    };

    var _Scene_Menu_create = Scene_Menu.prototype.create;
    Scene_Menu.prototype.create = function() {
        _Scene_Menu_create.call(this);
        this._imperioHeaderWindow = new Window_ImperioMenuHeader();
        this.addWindow(this._imperioHeaderWindow);

        var topY = this._imperioHeaderWindow.height;
        if (this._commandWindow) {
            this._commandWindow.y = topY;
        }
        if (this._statusWindow) {
            this._statusWindow.y = topY;
            this._statusWindow.height = Graphics.boxHeight - topY;
            this._statusWindow.refresh();
        }
    };

    //-------------------------------------------------------------------------
    // Estado Global do Diretor Cinematográfico
    //-------------------------------------------------------------------------
    var cinemaActive = false;
    var cinemaBarRatio = 0.0;
    var targetZoom = 1.0;
    var currentZoom = 1.0;
    var zoomSpeed = 0.02;

    var cartelaTitle = "";
    var cartelaSub = "";
    var cartelaTimer = 0;
    var cartelaMaxTimer = 260;

    var activeSlideName = "";

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === '1889_CINEMA') {
            var mode = (args[0] || '').toUpperCase();
            cinemaActive = (mode === 'ON');
            if ($gameSwitches) {
                $gameSwitches.setValue(7, cinemaActive);
            }
        } else if (command === '1889_ZOOM') {
            var requestedZoom = parseFloat(args[0] || '1.22');
            targetZoom = Math.min(1.28, Math.max(1.0, requestedZoom));
            var frames = Math.max(1, parseInt(args[1] || '40', 10));
            zoomSpeed = Math.abs(targetZoom - currentZoom) / frames;
            if (zoomSpeed < 0.002) zoomSpeed = 0.008;
        } else if (command === '1889_ZOOM_RESET') {
            targetZoom = 1.0;
            var rFrames = Math.max(1, parseInt(args[0] || '40', 10));
            zoomSpeed = Math.abs(1.0 - currentZoom) / rFrames;
            if (zoomSpeed < 0.002) zoomSpeed = 0.008;
        } else if (command === '1889_CARTELA') {
            var raw = args.join(' ');
            var parts = raw.split('|');
            cartelaTitle = (parts[0] || '').trim();
            cartelaSub = (parts[1] || '').trim();
            cartelaMaxTimer = 260;
            cartelaTimer = 260;
        } else if (command === '1889_SLIDE') {
            var slideArg = (args[0] || '').trim();
            if (slideArg.toUpperCase() === 'OFF' || slideArg === '') {
                activeSlideName = "";
            } else {
                activeSlideName = slideArg;
            }
        } else if (command === '1889_JORNADA') {
            var stNum = parseInt(args[0] || '1', 10);
            if ($gameVariables) {
                $gameVariables.setValue(3, Math.max(1, Math.min(12, stNum)));
            }
        }
    };

    var _Game_Screen_showPicture = Game_Screen.prototype.showPicture;
    Game_Screen.prototype.showPicture = function(pictureId, name, origin, x, y, scaleX, scaleY, opacity, blendMode) {
        if (name && name.indexOf('Bust_') === 0) {
            var rx = x / 816.0;
            var ry = y / 624.0;
            x = Math.round(Math.max(180, Math.min(Graphics.width - 180, rx * Graphics.width)));
            y = Math.round(Math.max(200, Math.min(Graphics.height - 230, ry * Graphics.height)));
            scaleX = Math.min(scaleX, 82);
            scaleY = Math.min(scaleY, 82);
        }
        _Game_Screen_showPicture.call(this, pictureId, name, origin, x, y, scaleX, scaleY, opacity, blendMode);
    };

    Window_Message.prototype.windowWidth = function() {
        return Math.min(1120, Graphics.boxWidth - 48);
    };

    Window_Message.prototype.standardFontSize = function() {
        return 23;
    };

    Window_Message.prototype.lineHeight = function() {
        return 34;
    };

    var _Window_Message_updatePlacement = Window_Message.prototype.updatePlacement;
    Window_Message.prototype.updatePlacement = function() {
        _Window_Message_updatePlacement.call(this);
        this.x = Math.round((Graphics.boxWidth - this.width) / 2);
        if (this._positionType === 2) {
            this.y = Graphics.boxHeight - this.height - 14;
        } else if (this._positionType === 0) {
            this.y = 14;
        }
    };

    //-------------------------------------------------------------------------
    // Sprite_ImperioSlide - Pinturas Widescreen do Prólogo com Auto-Fit & Ken Burns
    //-------------------------------------------------------------------------
    function Sprite_ImperioSlide() {
        this.initialize.apply(this, arguments);
    }

    Sprite_ImperioSlide.prototype = Object.create(Sprite.prototype);
    Sprite_ImperioSlide.prototype.constructor = Sprite_ImperioSlide;

    Sprite_ImperioSlide.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        this.x = Graphics.width / 2;
        this.y = Graphics.height / 2;
        this.opacity = 0;
        this._currentSlideName = "";
        this._kenBurnsTick = 0;
        this._baseScaleX = 1.0;
        this._baseScaleY = 1.0;
    };

    Sprite_ImperioSlide.prototype.update = function() {
        Sprite.prototype.update.call(this);

        if (activeSlideName !== this._currentSlideName) {
            if (activeSlideName !== "") {
                this._currentSlideName = activeSlideName;
                this._kenBurnsTick = 0;
                var bmp = ImageManager.loadPicture(this._currentSlideName);
                this.bitmap = bmp;
                var self = this;
                bmp.addLoadListener(function(loadedBmp) {
                    if (loadedBmp.width > 0 && loadedBmp.height > 0) {
                        var sx = Graphics.width / loadedBmp.width;
                        var sy = Graphics.height / loadedBmp.height;
                        var fitScale = Math.min(sx, sy);
                        var coverScale = Math.max(sx, sy);
                        var safeScale = fitScale * 0.72 + coverScale * 0.28;
                        self._baseScaleX = safeScale;
                        self._baseScaleY = safeScale;
                        self.scale.x = safeScale;
                        self.scale.y = safeScale;
                    }
                });
            } else {
                if (this.opacity <= 5) {
                    this._currentSlideName = "";
                    this.bitmap = null;
                }
            }
        }

        var targetOp = (activeSlideName !== "") ? 255 : 0;
        if (this.opacity < targetOp) {
            this.opacity = Math.min(255, this.opacity + 12);
        } else if (this.opacity > targetOp) {
            this.opacity = Math.max(0, this.opacity - 12);
        }

        if (this.opacity > 0 && this.bitmap && this.bitmap.isReady()) {
            this._kenBurnsTick++;
            var kbFactor = 1.0 + Math.min(0.045, this._kenBurnsTick * 0.00012);
            this.scale.x = this._baseScaleX * kbFactor;
            this.scale.y = this._baseScaleY * kbFactor;
            this.x = Graphics.width / 2;
            this.y = (Graphics.height / 2) - 10;
        }
    };

    //-------------------------------------------------------------------------
    // Sprite_ImperioCinema - Barras Widescreen + Cartela + HUD da Jornada do Herói
    //-------------------------------------------------------------------------
    function Sprite_ImperioCinema() {
        this.initialize.apply(this, arguments);
    }

    Sprite_ImperioCinema.prototype = Object.create(Sprite.prototype);
    Sprite_ImperioCinema.prototype.constructor = Sprite_ImperioCinema;

    Sprite_ImperioCinema.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this.bitmap = new Bitmap(Graphics.width, Graphics.height);
        this._lastStateHash = '';
    };

    Sprite_ImperioCinema.prototype.update = function() {
        Sprite.prototype.update.call(this);

        var swCinema = ($gameSwitches && $gameSwitches.value(7)) || cinemaActive;
        var targetBar = swCinema ? 1.0 : 0.0;
        if (Math.abs(cinemaBarRatio - targetBar) > 0.005) {
            cinemaBarRatio += (targetBar - cinemaBarRatio) * 0.14;
        } else {
            cinemaBarRatio = targetBar;
        }

        if (cartelaTimer > 0) {
            cartelaTimer--;
        }

        var tgCount  = $gameVariables ? $gameVariables.value(1) : 0;
        var gdCount  = $gameVariables ? $gameVariables.value(2) : 0;
        var stageIdx = ($gameVariables && $gameVariables.value(3) > 0) ? $gameVariables.value(3) : 5;
        var actTwo   = ($gameSwitches && $gameSwitches.value(5)) ? 1 : 0;
        var bossDef  = ($gameSwitches && $gameSwitches.value(6)) ? 1 : 0;
        var mapId    = $gameMap ? $gameMap.mapId() : 0;
        var hudOn    = ($gameSwitches && $gameSwitches.value(1)) && !swCinema && (mapId !== 3);

        var stateHash = [
            Math.round(cinemaBarRatio * 100),
            cartelaTimer,
            cartelaTitle,
            tgCount,
            gdCount,
            stageIdx,
            actTwo,
            bossDef,
            hudOn ? 1 : 0,
            mapId,
            activeSlideName
        ].join(':');

        if (stateHash !== this._lastStateHash) {
            this._lastStateHash = stateHash;
            this.redrawOverlay(swCinema, hudOn, tgCount, gdCount, stageIdx, actTwo, bossDef);
        }
    };

    Sprite_ImperioCinema.prototype.redrawOverlay = function(swCinema, hudOn, tgCount, gdCount, stageIdx, actTwo, bossDef) {
        var bmp = this.bitmap;
        bmp.clear();

        if (cinemaBarRatio > 0.01) {
            var barH = Math.round(54 * cinemaBarRatio);
            bmp.fillRect(0, 0, Graphics.width, barH, '#050508');
            bmp.fillRect(0, Graphics.height - barH, Graphics.width, barH, '#050508');
            bmp.fillRect(0, barH - 2, Graphics.width, 2, 'rgba(212, 175, 55, 0.75)');
            bmp.fillRect(0, Graphics.height - barH, Graphics.width, 2, 'rgba(212, 175, 55, 0.75)');
        }

        if (cartelaTimer > 0 && cartelaTitle.length > 0) {
            var alpha = 1.0;
            if (cartelaTimer > cartelaMaxTimer - 30) {
                alpha = (cartelaMaxTimer - cartelaTimer) / 30.0;
            } else if (cartelaTimer < 40) {
                alpha = cartelaTimer / 40.0;
            }
            bmp.paintOpacity = Math.max(0, Math.min(255, Math.round(alpha * 255)));

            var boxW = Math.min(980, Graphics.width - 80);
            var boxX = Math.round((Graphics.width - boxW) / 2);
            var boxY = (cinemaBarRatio > 0.2) ? 64 : 24;
            var boxH = (cartelaSub.length > 0) ? 74 : 46;

            bmp.fillRect(boxX, boxY, boxW, boxH, 'rgba(10, 8, 6, 0.90)');
            bmp.fillRect(boxX, boxY, boxW, 2, '#d4af37');
            bmp.fillRect(boxX, boxY + boxH - 2, boxW, 2, '#d4af37');

            bmp.fontFace = 'Georgia, "Times New Roman", serif';
            bmp.fontSize = 21;
            bmp.textColor = '#f4d47c';
            bmp.outlineColor = 'rgba(0,0,0,0.95)';
            bmp.outlineWidth = 4;
            bmp.drawText(cartelaTitle, boxX + 16, boxY + 8, boxW - 32, 30, 'center');

            if (cartelaSub.length > 0) {
                bmp.fontSize = 15;
                bmp.textColor = '#e6e1d6';
                bmp.drawText(cartelaSub, boxX + 16, boxY + 40, boxW - 32, 26, 'center');
            }
            bmp.paintOpacity = 255;
        }

        if (hudOn) {
            var px = 18;
            var py = 18;
            var pw = 450;
            var ph = 112;

            bmp.fillRect(px, py, pw, ph, 'rgba(14, 11, 8, 0.88)');
            bmp.fillRect(px, py, pw, 2, '#d4af37');
            bmp.fillRect(px, py + ph - 2, pw, 2, '#d4af37');
            bmp.fillRect(px, py, 4, ph, '#9b1c1c');
            bmp.fillRect(px + pw - 2, py, 2, ph, '#d4af37');

            var stageTitle = HERO_STAGES[stageIdx] || HERO_STAGES[5];
            bmp.fontFace = 'Georgia, "Times New Roman", serif';
            bmp.fontSize = 14;
            bmp.textColor = '#e6c265';
            bmp.outlineColor = 'rgba(0,0,0,0.95)';
            bmp.outlineWidth = 3;
            bmp.drawText('✦ JORNADA DO HERÓI — ' + stageTitle, px + 14, py + 6, pw - 24, 22, 'left');

            bmp.fillRect(px + 14, py + 30, pw - 28, 1, 'rgba(212, 175, 55, 0.35)');

            if (bossDef) {
                bmp.fontSize = 14;
                bmp.textColor = '#a8e6b0';
                bmp.drawText('★ XII. Retorno com o Elixir: Lista de Sampaio Ferraz Queimada', px + 14, py + 36, pw - 24, 22, 'left');
                bmp.textColor = '#f2ede4';
                bmp.drawText('• Os capoeiras da Pequena África estão salvos de Noronha!', px + 14, py + 60, pw - 24, 22, 'left');
                bmp.textColor = '#f4d47c';
                bmp.drawText('• Visite a Redação d\'A Cidade do Rio (nº 101) para Salvar', px + 14, py + 82, pw - 24, 22, 'left');
            } else if (actTwo) {
                bmp.fontSize = 14;
                bmp.textColor = '#ff7b6b';
                bmp.drawText('⚔ VIII. A Provação Suprema: Duelo no Portão do Campo de Santana', px + 14, py + 36, pw - 24, 22, 'left');
                bmp.textColor = '#f2ede4';
                bmp.drawText('• Enfrente o Coronel Aureliano Valadares ao Norte (x=13, y=5)!', px + 14, py + 60, pw - 24, 22, 'left');
                bmp.textColor = '#f4d47c';
                bmp.drawText('• Recrute Dandara (O Paiz nº 63) e Ten. Juca (Diário nº 70)', px + 14, py + 82, pw - 24, 22, 'left');
            } else {
                bmp.fontSize = 14;
                bmp.textColor = (tgCount >= 3) ? '#8ce89b' : '#f2ede4';
                bmp.drawText('◆ Despachos Falsos do Major Solón Confiscados: ' + tgCount + ' / 3', px + 14, py + 36, pw - 24, 22, 'left');
                bmp.textColor = (gdCount >= 3) ? '#8ce89b' : '#d8d4c8';
                bmp.drawText('⚔ Rondas da 2ª Brigada Neutralizadas: ' + gdCount + ' / 3', px + 14, py + 60, pw - 24, 22, 'left');
                bmp.textColor = '#d4af37';
                bmp.drawText('• Aliados na Rua do Ouvidor: O Paiz (nº 63) e Diário (nº 70)', px + 14, py + 82, pw - 24, 22, 'left');
            }
        }
    };

    var _Scene_Map_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
    Scene_Map.prototype.createDisplayObjects = function() {
        _Scene_Map_createDisplayObjects.call(this);

        this._imperioSlideBackdrop = new Sprite(new Bitmap(Graphics.width, Graphics.height));
        this._imperioSlideBackdrop.bitmap.fillRect(0, 0, Graphics.width, Graphics.height, '#050508');
        this._imperioSlideBackdrop.opacity = 0;

        this._imperioSlideSprite = new Sprite_ImperioSlide();
        this._imperioCinemaSprite = new Sprite_ImperioCinema();

        var winIndex = this.children.indexOf(this._windowLayer);
        if (winIndex >= 0) {
            this.addChildAt(this._imperioSlideBackdrop, winIndex);
            this.addChildAt(this._imperioSlideSprite, winIndex + 1);
            this.addChildAt(this._imperioCinemaSprite, winIndex + 2);
        } else {
            this.addChild(this._imperioSlideBackdrop);
            this.addChild(this._imperioSlideSprite);
            this.addChild(this._imperioCinemaSprite);
        }
    };

    var _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);

        if (this._imperioSlideBackdrop && this._imperioSlideSprite) {
            this._imperioSlideBackdrop.opacity = this._imperioSlideSprite.opacity;
        }

        if (Math.abs(currentZoom - targetZoom) > 0.002) {
            if (currentZoom < targetZoom) {
                currentZoom = Math.min(targetZoom, currentZoom + zoomSpeed);
            } else {
                currentZoom = Math.max(targetZoom, currentZoom - zoomSpeed);
            }
        } else {
            currentZoom = targetZoom;
        }

        if (this._spriteset) {
            this._spriteset.scale.x = currentZoom;
            this._spriteset.scale.y = currentZoom;

            if (currentZoom > 1.001 && $gamePlayer) {
                var focusX = $gamePlayer.screenX();
                var focusY = $gamePlayer.screenY() - 24;
                var rawX = (Graphics.width * 0.5) - (focusX * currentZoom);
                var rawY = (Graphics.height * 0.5) - (focusY * currentZoom);
                var minX = Graphics.width * (1.0 - currentZoom);
                var minY = Graphics.height * (1.0 - currentZoom);
                this._spriteset.x = Math.round(Math.max(minX, Math.min(0, rawX)));
                this._spriteset.y = Math.round(Math.max(minY, Math.min(0, rawY)));
            } else {
                this._spriteset.x = 0;
                this._spriteset.y = 0;
            }
        }
    };

})();
