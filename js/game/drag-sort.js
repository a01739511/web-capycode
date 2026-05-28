(function () {
    // El armado por arrastre se mantiene separado porque es la parte con mas
    // eventos de puntero y DOM del runner.
    function getDraggedRow(selector, predicate) {
        return Array.from(document.querySelectorAll(selector)).find(predicate);
    }

    function moveRowBefore(row, targetRow) {
        if (row && targetRow && row !== targetRow) {
            targetRow.parentElement.insertBefore(row, targetRow);
        }
    }

    function moveRowAfter(row, targetRow) {
        if (row && targetRow && row !== targetRow) {
            targetRow.parentElement.insertBefore(row, targetRow.nextSibling);
        }
    }

    function createRuntime(options) {
        const settings = options || {};
        const state = settings.state || {};
        const getCurrentExercise = settings.getCurrentExercise || function () {
            return null;
        };
        const renderer = window.CapyGameRenderer;

        function renderExercise(container, exercise) {
            const layout = document.createElement("section");
            layout.className = "sortable-layout";
            layout.innerHTML = [
                "<article class=\"sortable-panel\">",
                "<div class=\"sortable-panel-head\">",
                "<p class=\"panel-kicker\">Bloques disponibles</p>",
                "<p>Arrastra cada línea desde aquí.</p>",
                "</div>",
                "<div class=\"sortable-list\" id=\"sortable-bank\" data-order-zone=\"bank\" aria-label=\"Bloques disponibles\"></div>",
                "</article>",
                "<article class=\"sortable-panel is-builder\">",
                "<div class=\"sortable-panel-head\">",
                "<p class=\"panel-kicker\">Area de construcción</p>",
                "<p>Forma el código correcto aquí.</p>",
                "</div>",
                "<div class=\"sortable-list is-builder\" id=\"sortable-build\" data-order-zone=\"build\" aria-label=\"Area de construcción\"></div>",
                "</article>"
            ].join("");

            container.appendChild(layout);
            paintSortable(exercise);
        }

        function paintSortable(exercise) {
            const bank = document.getElementById("sortable-bank");
            const build = document.getElementById("sortable-build");

            if (!bank || !build) {
                return;
            }

            bank.innerHTML = "";
            build.innerHTML = "";

            paintSortableZone(bank, state.orderBankItems, "bank");
            paintSortableZone(build, state.orderItems, "build");

            renderSortableBuildPlaceholder(build);
            bindOrderZone(bank);
            bindOrderZone(build);
            syncOrderItemsFromDom(exercise);
        }

        function paintSortableZone(zoneElement, items, zoneName) {
            items.forEach(function (item, index) {
                const article = document.createElement("article");
                article.className = "sortable-row";
                article.dataset.index = String(index);
                article.dataset.lineId = item.id;
                article.dataset.orderZone = zoneName;
                article.innerHTML = [
                    "<button class=\"drag-pill\" type=\"button\" draggable=\"true\" aria-label=\"Arrastrar línea ", index + 1, "\"><img src=\"assets/menu-icon.svg\" alt=\"\"></button>",
                    "<div class=\"sortable-row-code\">",
                    renderer.buildCodeLineMarkup(item.text, index + 1, items.length),
                    "</div>"
                ].join("");
                bindDragHandle(article);
                zoneElement.appendChild(article);
            });
        }

        function bindDragHandle(article) {
            const handle = article.querySelector(".drag-pill");

            if (!handle) {
                return;
            }

            handle.addEventListener("dragstart", function (event) {
                state.draggedLineId = article.dataset.lineId;
                article.classList.add("is-dragging");
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", state.draggedLineId);
                event.dataTransfer.setDragImage(article, 24, 24);
            });

            handle.addEventListener("dragend", function () {
                article.classList.remove("is-dragging");
                syncOrderItemsFromDom(getCurrentExercise());
                state.draggedLineId = "";
            });

            article.addEventListener("dragover", function (event) {
                const draggedRow = getCurrentDraggedRow();

                if (!draggedRow || draggedRow === article) {
                    return;
                }

                event.preventDefault();
                const list = article.parentElement;
                const rect = article.getBoundingClientRect();
                const shouldPlaceAfter = event.clientY > rect.top + rect.height / 2;

                if (shouldPlaceAfter) {
                    list.insertBefore(draggedRow, article.nextSibling);
                } else {
                    list.insertBefore(draggedRow, article);
                }
            });

            article.addEventListener("drop", function (event) {
                event.preventDefault();
                syncOrderItemsFromDom(getCurrentExercise());
            });

            handle.addEventListener("pointerdown", function (event) {
                beginPointerDrag(event, article);
            });
        }

        function bindOrderZone(zoneElement) {
            zoneElement.addEventListener("dragover", function (event) {
                const draggedRow = getCurrentDraggedRow();

                if (!draggedRow) {
                    return;
                }

                event.preventDefault();

                if (!event.target.closest(".sortable-row")) {
                    removeSortableBuildPlaceholder(zoneElement);
                    zoneElement.appendChild(draggedRow);
                }
            });

            zoneElement.addEventListener("drop", function (event) {
                const draggedRow = getCurrentDraggedRow();

                if (!draggedRow) {
                    return;
                }

                event.preventDefault();

                if (!event.target.closest(".sortable-row")) {
                    removeSortableBuildPlaceholder(zoneElement);
                    zoneElement.appendChild(draggedRow);
                }

                syncOrderItemsFromDom(getCurrentExercise());
            });
        }

        function beginPointerDrag(event, article) {
            if (event.button !== undefined && event.button !== 0) {
                return;
            }

            event.preventDefault();
            state.pointerDragLineId = article.dataset.lineId;
            article.classList.add("is-dragging");
            document.addEventListener("pointermove", handlePointerDragMove);
            document.addEventListener("pointerup", endPointerDrag);
            document.addEventListener("pointercancel", endPointerDrag);
        }

        function handlePointerDragMove(event) {
            const draggedRow = getPointerDraggedRow();

            if (!draggedRow) {
                return;
            }

            event.preventDefault();
            const target = document.elementFromPoint(event.clientX, event.clientY);
            const targetRow = target ? target.closest(".sortable-row") : null;
            const targetZone = target ? target.closest("[data-order-zone]") : null;

            if (targetRow && targetRow !== draggedRow) {
                const rect = targetRow.getBoundingClientRect();
                const shouldPlaceAfter = event.clientY > rect.top + rect.height / 2;

                if (shouldPlaceAfter) {
                    moveRowAfter(draggedRow, targetRow);
                } else {
                    moveRowBefore(draggedRow, targetRow);
                }

                syncOrderItemsFromDom(getCurrentExercise());
                return;
            }

            if (targetZone) {
                removeSortableBuildPlaceholder(targetZone);
                targetZone.appendChild(draggedRow);
                syncOrderItemsFromDom(getCurrentExercise());
            }
        }

        function endPointerDrag() {
            const draggedRow = getPointerDraggedRow();

            if (draggedRow) {
                draggedRow.classList.remove("is-dragging");
            }

            syncOrderItemsFromDom(getCurrentExercise());
            state.pointerDragLineId = "";
            document.removeEventListener("pointermove", handlePointerDragMove);
            document.removeEventListener("pointerup", endPointerDrag);
            document.removeEventListener("pointercancel", endPointerDrag);
        }

        function getPointerDraggedRow() {
            if (!state.pointerDragLineId) {
                return null;
            }

            return getDraggedRow("[data-line-id]", function (row) {
                return row.dataset.lineId === state.pointerDragLineId;
            }) || null;
        }

        function getCurrentDraggedRow() {
            if (!state.draggedLineId) {
                return null;
            }

            return getDraggedRow("[data-line-id]", function (row) {
                return row.dataset.lineId === state.draggedLineId;
            }) || null;
        }

        function syncOrderItemsFromDom(exercise) {
            const bank = document.getElementById("sortable-bank");
            const build = document.getElementById("sortable-build");

            if (!bank || !build || !exercise) {
                return;
            }

            const sourceLines = (exercise.contentData.lines || []).map(function (line) {
                return {
                    id: line.id,
                    text: line.text
                };
            });
            const itemsById = new Map(sourceLines.map(function (item) {
                return [String(item.id), item];
            }));

            state.orderBankItems = Array.from(bank.querySelectorAll("[data-line-id]")).map(function (row) {
                return itemsById.get(String(row.dataset.lineId));
            }).filter(Boolean);
            state.orderItems = Array.from(build.querySelectorAll("[data-line-id]")).map(function (row) {
                return itemsById.get(String(row.dataset.lineId));
            }).filter(Boolean);
            renderSortableBuildPlaceholder(build);
        }

        function renderSortableBuildPlaceholder(build) {
            if (!build) {
                return;
            }

            removeSortableBuildPlaceholder(build);

            if (state.orderItems.length) {
                return;
            }

            build.insertAdjacentHTML("beforeend", [
                "<div class=\"sortable-empty-state\">",
                "<strong>Construye tu respuesta aquí</strong>",
                "<span>Suelta las líneas en esta zona para ordenarlas.</span>",
                "</div>"
            ].join(""));
        }

        function removeSortableBuildPlaceholder(zoneElement) {
            if (!zoneElement || zoneElement.id !== "sortable-build") {
                return;
            }

            zoneElement.querySelectorAll(".sortable-empty-state").forEach(function (emptyState) {
                emptyState.remove();
            });
        }

        return {
            renderExercise: renderExercise,
            syncOrderItemsFromDom: syncOrderItemsFromDom
        };
    }

    window.CapyGameDragSort = {
        getDraggedRow: getDraggedRow,
        moveRowBefore: moveRowBefore,
        moveRowAfter: moveRowAfter,
        createRuntime: createRuntime
    };
}());
