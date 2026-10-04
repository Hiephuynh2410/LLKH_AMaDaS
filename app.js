'use strict';

(() => {
    // =========================================================
    // 1. CẤU HÌNH BIỂU MẪU
    // =========================================================

    const KEY = 'llkh-profile-v1';

    const FIELDS = [
        ['name', '1. Họ và tên'],
        ['birth', '2. Ngày/tháng/năm sinh'],
        ['gender', 'Nam/Nữ'],
        ['identity', '3. Số định danh cá nhân'],
        ['academicTitle', '4. Học hàm'],
        ['titleYear', 'Năm được phong học hàm'],
        ['degree', 'Học vị'],
        ['degreeYear', 'Năm đạt học vị'],
        ['professionalTitle', '5. Chức danh nghề nghiệp'],
        ['position', 'Chức vụ'],
        ['phone', '6. Điện thoại'],
        ['email', 'E-mail'],
        ['address', '7. Địa chỉ'],
        ['organization', '8. Tên tổ chức nơi làm việc'],
        ['head', 'Tên người đứng đầu tổ chức'],
        ['workPhone', 'Điện thoại nơi làm việc'],
        ['workAddress', 'Địa chỉ nơi làm việc']
    ];

    const TABLES = [
        {
            key: 'education',
            title: '9. Quá trình đào tạo',
            headers: [
                'Bậc đào tạo',
                'Nơi đào tạo',
                'Chuyên ngành',
                'Năm tốt nghiệp'
            ],
            number: true
        },
        {
            key: 'work',
            title: '10. Quá trình công tác',
            headers: [
                'Thời gian',
                'Nơi công tác',
                'Chức danh, chức vụ'
            ],
            number: true
        },
        {
            key: 'research',
            title: '11. Lĩnh vực và kinh nghiệm nghiên cứu',
            headers: [
                'Lĩnh vực nghiên cứu',
                'Kinh nghiệm và kết quả nghiên cứu'
            ],
            number: true
        },
        {
            key: 'masters',
            title: '12. Hướng dẫn học viên cao học',
            headers: [
                'Họ và tên học viên',
                'Thời gian hướng dẫn',
                'Tên luận văn và cơ sở đào tạo',
                'Kết quả / năm tốt nghiệp'
            ],
            number: true
        },
        {
            key: 'doctoral',
            title: '12. Hướng dẫn nghiên cứu sinh',
            headers: [
                'Họ và tên nghiên cứu sinh',
                'Thời gian hướng dẫn',
                'Tên luận án và cơ sở đào tạo',
                'Kết quả / năm tốt nghiệp'
            ],
            number: true
        },
        {
            key: 'publications',
            title: '13. Các công trình khoa học đã công bố',
            headers: [
                'Tên công trình',
                'Vai trò tác giả',
                'Tạp chí / hội nghị; ISSN / ISBN',
                'Năm công bố'
            ],
            number: true
        },
        {
            key: 'patents',
            title: '14. Văn bằng bảo hộ sở hữu trí tuệ',
            headers: [
                'Tên văn bằng / đối tượng bảo hộ',
                'Số văn bằng, cơ quan cấp và năm cấp'
            ],
            number: true
        },
        {
            key: 'projectsLead',
            title: '15. Các nhiệm vụ KH&CN đã chủ trì',
            headers: [
                'Tên nhiệm vụ và mã số',
                'Thời gian thực hiện',
                'Cấp quản lý',
                'Kết quả nghiệm thu'
            ],
            number: true
        },
        {
            key: 'projectsJoin',
            title: '15. Các nhiệm vụ KH&CN đã tham gia',
            headers: [
                'Tên nhiệm vụ và mã số',
                'Thời gian thực hiện',
                'Vai trò tham gia',
                'Kết quả nghiệm thu'
            ],
            number: true
        },
        {
            key: 'awards',
            title: '16. Giải thưởng về khoa học và công nghệ',
            headers: [
                'Tên giải thưởng',
                'Cơ quan trao và năm nhận'
            ],
            number: true
        }
    ];

    const $ = id => document.getElementById(id);

    const form = $('form');

    if (!form) {
        console.error('Không tìm thấy <form id="form"> trong index.html.');
        return;
    }

    let toastTimer;
    let pdfUrl;
    let importedExtraData = {};

    function el(tag, props = {}, children = []) {
        const node = document.createElement(tag);
        Object.assign(node, props);

        children.forEach(child => node.append(child));

        return node;
    }

    function notify(message) {
        const toast = $('toast');

        if (!toast) {
            console.warn(message);
            return;
        }

        toast.textContent = message;
        toast.style.display = 'block';

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toast.style.display = 'none';
        }, 4500);
    }

    function setStatus(message) {
        if ($('saveStatus')) {
            $('saveStatus').textContent = message;
        }
    }

    function markDirty() {
        setStatus('Có thay đổi chưa lưu');
    }

    // =========================================================
    // 2. TẠO CÁC TRƯỜNG VÀ BẢNG
    // =========================================================

    FIELDS.forEach(([key, label]) => {
        $('personalFields').append(
            el('label', { textContent: label }, [
                el('input', {
                    name: key,
                    type: key === 'email' ? 'email' : 'text',
                    placeholder: label.replace(/^\d+\.\s*/, '')
                })
            ])
        );
    });

    TABLES.forEach((table, index) => {
        const section = el('section', {
            className: 'card',
            id: table.key
        });

        section.append(
            el('div', { className: 'section-top' }, [
                el('span', {
                    className: 'section-number',
                    textContent: String(index + 3).padStart(2, '0')
                }),
                el('div', {}, [
                    el('h2', { textContent: table.title }),
                    el('p', {
                        textContent:
                            'Thêm các dòng cần thiết. Có thể xuống dòng trong từng ô.'
                    })
                ])
            ]),
            el('div', { className: 'entries' }),
            el('button', {
                type: 'button',
                className: 'add',
                textContent: '+ Thêm dòng',
                onclick: () => {
                    addRow(table);
                    markDirty();
                }
            })
        );

        $('tableSections').append(section);
    });

    function addRow(table, values = []) {
        const target = $(table.key).querySelector('.entries');

        const entry = el('div', { className: 'entry' });

        entry.append(
            el('div', { className: 'entry-head' }, [
                el('strong', {
                    textContent: 'Dòng ' + (target.children.length + 1)
                }),
                el('button', {
                    type: 'button',
                    className: 'remove',
                    textContent: 'Xóa dòng',
                    onclick: () => {
                        entry.remove();
                        renumber(table);
                        markDirty();
                    }
                })
            ])
        );

        const grid = el('div', { className: 'field-grid' });

        table.headers.forEach((header, column) => {
            grid.append(
                el('label', { textContent: header }, [
                    el('textarea', {
                        rows: 2,
                        value: values[column] || '',
                        placeholder: header
                    })
                ])
            );
        });

        entry.append(grid);
        target.append(entry);
    }

    function renumber(table) {
        $(table.key)
            .querySelectorAll('.entry-head strong')
            .forEach((node, index) => {
                node.textContent = 'Dòng ' + (index + 1);
            });
    }

    // =========================================================
    // 3. ĐỌC, KIỂM TRA VÀ LƯU HỒ SƠ
    // =========================================================

    function collect() {
        // Giữ các khóa chưa được hiển thị từ hồ sơ cũ.
        const data = {
            ...importedExtraData,
            version: 1
        };

        form.querySelectorAll('[name]').forEach(input => {
            data[input.name] =
                input.type === 'checkbox'
                    ? input.checked
                    : input.value.trim();
        });

        TABLES.forEach(table => {
            data[table.key] = [
                ...$(table.key).querySelectorAll('.entry')
            ]
                .map(row =>
                    [...row.querySelectorAll('textarea')]
                        .map(input => input.value.trim())
                )
                .filter(row => row.some(Boolean));
        });

        return data;
    }

    function validateProfile(data) {
        if (
            !data ||
            typeof data !== 'object' ||
            Array.isArray(data) ||
            data.version !== 1
        ) {
            throw new Error('Tệp không phải hồ sơ LLKH phiên bản 1.');
        }

        form.querySelectorAll('[name]').forEach(input => {
            const expected =
                input.type === 'checkbox' ? 'boolean' : 'string';

            if (
                data[input.name] != null &&
                typeof data[input.name] !== expected
            ) {
                throw new Error(
                    'Dữ liệu trường ' + input.name + ' không hợp lệ.'
                );
            }
        });

        TABLES.forEach(table => {
            const rows = data[table.key];

            if (rows == null) return;

            const valid =
                Array.isArray(rows) &&
                rows.every(row =>
                    Array.isArray(row) &&
                    row.length === table.headers.length &&
                    row.every(value => typeof value === 'string')
                );

            if (!valid) {
                throw new Error(
                    'Bảng "' + table.title +
                    '" không khớp số cột của cấu hình hiện tại. ' +
                    'Cần đối chiếu schema.js gốc trước khi nhập.'
                );
            }
        });

        return data;
    }

    function load(data) {
        const knownKeys = new Set([
            'version',
            ...[...form.querySelectorAll('[name]')]
                .map(input => input.name),
            ...TABLES.map(table => table.key)
        ]);

        importedExtraData = Object.fromEntries(
            Object.entries(data)
                .filter(([key]) => !knownKeys.has(key))
        );

        form.querySelectorAll('[name]').forEach(input => {
            if (input.type === 'checkbox') {
                input.checked = Boolean(data[input.name]);
            } else {
                input.value = data[input.name] || '';
            }
        });

        TABLES.forEach(table => {
            $(table.key).querySelector('.entries').replaceChildren();

            (data[table.key] || []).forEach(row => {
                addRow(table, row);
            });
        });

        if (Object.keys(importedExtraData).length) {
            notify(
                'Hồ sơ có dữ liệu ngoài cấu hình hiện tại. ' +
                'Dữ liệu đó được giữ trong JSON nhưng chưa hiển thị trên PDF.'
            );
        }
    }

    function save() {
        const data = collect();

        try {
            localStorage.setItem(KEY, JSON.stringify(data));
        } catch {
            throw new Error(
                'Không lưu được trên thiết bị. Hãy tải JSON để sao lưu.'
            );
        }

        setStatus(
            'Đã lưu lúc ' + new Date().toLocaleTimeString('vi-VN')
        );

        return data;
    }

    form.addEventListener('input', markDirty);
    form.addEventListener('change', markDirty);

    form.addEventListener('submit', event => {
        event.preventDefault();
    });

    try {
        const stored = localStorage.getItem(KEY);

        if (stored) {
            load(validateProfile(JSON.parse(stored)));
            setStatus('Đã khôi phục hồ sơ đã lưu');
        }
    } catch (error) {
        // Không xóa hoặc ghi đè hồ sơ cũ nếu cấu hình không khớp.
        notify('Không khôi phục được hồ sơ: ' + error.message);
        setStatus('Hồ sơ cũ chưa được khôi phục');

        // Cho phép sao lưu nguyên dữ liệu cũ trước khi tiếp tục.
        const oldData = localStorage.getItem(KEY);

        if (oldData && confirm(
            'Hồ sơ đã lưu chưa khớp cấu hình hiện tại. ' +
            'Bạn có muốn tải bản JSON gốc để sao lưu không?'
        )) {
            downloadBlob(
                new Blob([oldData], { type: 'application/json' }),
                'ly-lich-khoa-hoc-ban-goc.json'
            );
        }
    }

    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);

        const link = el('a', {
            href: url,
            download: filename
        });

        document.body.append(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(url), 10000);
    }

    $('backupBtn').onclick = () => {
        downloadBlob(
            new Blob(
                [JSON.stringify(collect(), null, 2)],
                { type: 'application/json' }
            ),
            'ly-lich-khoa-hoc.json'
        );
    };

    $('importBtn').onclick = () => {
        $('importFile').click();
    };

    $('importFile').onchange = async event => {
        const file = event.target.files[0];

        if (!file) return;

        try {
            if (file.size > 5 * 1024 * 1024) {
                throw new Error('Tệp vượt quá 5 MB.');
            }

            const data = validateProfile(
                JSON.parse(await file.text())
            );

            if (!confirm(
                'Nhập hồ sơ sẽ thay thế thông tin đang nhập. Tiếp tục?'
            )) {
                return;
            }

            load(data);
            markDirty();

            notify(
                'Đã nhập hồ sơ. Nhấn Lưu & xuất PDF để lưu.'
            );
        } catch (error) {
            notify(error.message);
        } finally {
            event.target.value = '';
        }
    };

    $('clearBtn').onclick = () => {
        if (!confirm(
            'Xóa toàn bộ thông tin đang nhập và hồ sơ trên thiết bị này?'
        )) {
            return;
        }

        try {
            localStorage.removeItem(KEY);
            load({});
            setStatus('Chưa lưu');
            notify('Đã xóa hồ sơ.');
        } catch {
            notify('Không xóa được dữ liệu trên thiết bị.');
        }
    };

    // =========================================================
    // 4. TẠO PDF
    // =========================================================

    const blank = value => value || '……………………';

    const cell = value => ({
        text: String(value ?? ''),
        margin: [3, 4, 3, 4]
    });

    const tableLayout = {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5
    };

    function documentDefinition(data = {}) {
    const textValue = value => String(value ?? '').trim();
    const blank = value => textValue(value) || '……………………';

    const cell = value => ({
        text: String(value ?? ''),
        margin: [3, 4, 3, 4]
    });

    const tableLayout = {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5
    };

    function checkbox(checked) {
        return {
            canvas: [
                {
                    type: 'rect',
                    x: 5,
                    y: 2,
                    w: 10,
                    h: 10,
                    lineWidth: 0.7
                },
                ...(checked ? [
                    {
                        type: 'line',
                        x1: 6,
                        y1: 7,
                        x2: 9,
                        y2: 10,
                        lineWidth: 1
                    },
                    {
                        type: 'line',
                        x1: 9,
                        y1: 10,
                        x2: 14,
                        y2: 3,
                        lineWidth: 1
                    }
                ] : [])
            ]
        };
    }

    // =====================================================
    // ĐẦU TRANG
    // =====================================================

    const content = [
        {
            text: 'Mẫu III.03-LLCN\n09/2024/TT-BKHCN',
            alignment: 'right',
            fontSize: 10,
            margin: [0, 0, 0, 14]
        },
        {
            text: 'LÝ LỊCH KHOA HỌC',
            alignment: 'center',
            bold: true,
            fontSize: 15
        },
        {
            text:
                'CỦA CÁ NHÂN THỰC HIỆN NHIỆM VỤ ' +
                'KHOA HỌC VÀ CÔNG NGHỆ',
            alignment: 'center',
            bold: true,
            fontSize: 11,
            margin: [0, 5, 0, 16]
        },
        {
            text: 'Tên nhiệm vụ: ' + blank(data.task),
            margin: [0, 0, 0, 10]
        },
        {
            table: {
                widths: ['*', 25],
                body: [
                    [
                        'ĐĂNG KÝ CHỦ NHIỆM NHIỆM VỤ:',
                        checkbox(data.leadRole)
                    ],
                    [
                        'ĐĂNG KÝ THỰC HIỆN CHÍNH / THƯ KÝ KHOA HỌC:',
                        checkbox(data.mainRole)
                    ]
                ]
            },
            margin: [0, 0, 0, 12]
        }
    ];

    // =====================================================
    // THÔNG TIN CÁ NHÂN
    // =====================================================

    const info = [
        `1. Họ và tên: ${blank(data.name)}`,

        `2. Ngày/tháng/năm sinh: ${blank(data.birth)}\n` +
        `   Nam/Nữ: ${blank(data.gender)}`,

        `3. Số định danh cá nhân: ${blank(data.identity)}`,

        `4. Học hàm: ${blank(data.academicTitle)}\n` +
        `   Năm được phong học hàm: ${blank(data.titleYear)}\n` +
        `   Học vị: ${blank(data.degree)}\n` +
        `   Năm đạt học vị: ${blank(data.degreeYear)}`,

        `5. Chức danh nghề nghiệp: ${blank(data.professionalTitle)}\n` +
        `   Chức vụ: ${blank(data.position)}`,

        `6. Điện thoại: ${blank(data.phone)}\n` +
        `   E-mail: ${blank(data.email)}`,

        `7. Địa chỉ: ${blank(data.address)}`,

        `8. Nơi làm việc\n` +
        `   Tên tổ chức: ${blank(data.organization)}\n` +
        `   Tên người đứng đầu: ${blank(data.head)}\n` +
        `   Điện thoại: ${blank(data.workPhone)}\n` +
        `   Địa chỉ: ${blank(data.workAddress)}`
    ];

    content.push({
        table: {
            widths: ['*'],
            body: info.map(value => [cell(value)])
        },
        layout: tableLayout
    });

    // =====================================================
    // CÁC BẢNG THEO CẤU HÌNH TABLES HIỆN TẠI
    // =====================================================

    TABLES.forEach(table => {
        const headers = table.number
            ? ['TT', ...table.headers]
            : table.headers;

        const rows =
            Array.isArray(data[table.key]) && data[table.key].length
                ? data[table.key]
                : [table.headers.map(() => '')];

        const widths = headers.map((header, index) =>
            table.number && index === 0 ? 23 : '*'
        );

        const body = [
            headers.map(header => ({
                ...cell(header),
                bold: true,
                alignment: 'center'
            })),

            ...rows.map((row, index) => {
                const values = table.headers.map(
                    (header, column) => row[column] ?? ''
                );

                return (
                    table.number
                        ? [String(index + 1), ...values]
                        : values
                ).map(cell);
            })
        ];

        content.push(
            {
                text: table.title,
                bold: true,
                margin: [0, 12, 0, 5]
            },
            {
                table: {
                    headerRows: 1,
                    widths,
                    body
                },
                layout: tableLayout,
                fontSize: 10
            }
        );
    });

    // =====================================================
    // KẾT QUẢ HOẠT ĐỘNG KHÁC
    // =====================================================

    content.push(
        {
            text:
                '17. Kết quả hoạt động KH&CN ' +
                'và sản xuất kinh doanh khác',
            bold: true,
            margin: [0, 12, 0, 5]
        },
        {
            table: {
                widths: ['*'],
                body: [[cell(data.other || ' ')]]
            },
            layout: tableLayout
        }
    );

    // =====================================================
    // NGÀY LẬP, CAM KẾT VÀ CHỮ KÝ
    // =====================================================

    let date = 'ngày ....... tháng ....... năm 20...';

    if (/^\d{4}-\d{2}-\d{2}$/.test(data.signedDate || '')) {
        const [year, month, day] = data.signedDate.split('-');

        date = `ngày ${day} tháng ${month} năm ${year}`;
    }

    // Tên trong câu cam kết: ưu tiên ô riêng, sau đó lấy mục 1.
    const commitmentName =
        textValue(data.commitmentName) ||
        textValue(data.name) ||
        '……………………';

    // Tên cá nhân in sẵn dưới chữ ký.
    const personalSignerName =
        textValue(data.personalSignerName) ||
        textValue(data.name);

    // Tên và chức vụ đại diện đơn vị.
    const organizationSignerName =
        textValue(data.organizationSignerName);

    const organizationSignerPosition =
        textValue(data.organizationSignerPosition);

    // Luôn giữ toàn bộ nội dung cam kết.
    // Không dùng data.confirmation để thay thế bằng một họ tên.
    const commitmentText =
        'Đơn vị đồng ý và sẽ dành thời gian cần thiết để ' +
        'Ông, Bà ' + commitmentName +
        ' chủ trì (tham gia) thực hiện nhiệm vụ KH&CN.';

    // Giữ ngày lập, phần chữ ký và cam kết trong cùng một khối.
    content.push({
        unbreakable: true,

        stack: [
            {
                text:
                    `${textValue(data.place) || '............'}, ${date}`,
                alignment: 'right',
                margin: [0, 18, 0, 12]
            },

            {
                table: {
                    widths: ['*', '*'],
                    dontBreakRows: true,

                    body: [
                        [
                            {
                                text:
                                    'TỔ CHỨC - NƠI LÀM VIỆC CỦA CÁ NHÂN ' +
                                    'ĐĂNG KÝ CHỦ NHIỆM (HOẶC THAM GIA ' +
                                    'THỰC HIỆN CHÍNH) NHIỆM VỤ KH&CN',
                                bold: true,
                                alignment: 'center',
                                fontSize: 10,
                                margin: [0, 0, 0, 6]
                            },
                            {
                                text:
                                    'CÁ NHÂN ĐĂNG KÝ CHỦ NHIỆM\n' +
                                    '(HOẶC THAM GIA THỰC HIỆN CHÍNH)\n' +
                                    'NHIỆM VỤ KH&CN',
                                bold: true,
                                alignment: 'center',
                                fontSize: 10,
                                margin: [0, 0, 0, 6]
                            }
                        ],

                        [
                            {
                                text: '(Ký, ghi rõ họ tên và đóng dấu)',
                                alignment: 'center',
                                italics: true,
                                fontSize: 10
                            },
                            {
                                text: '(Ký và ghi rõ họ tên)',
                                alignment: 'center',
                                italics: true,
                                fontSize: 10
                            }
                        ],

                        // Khoảng trống để ký trực tiếp sau khi in.
                        [
                            {
                                text: ' ',
                                margin: [0, 0, 0, 72]
                            },
                            {
                                text: ' ',
                                margin: [0, 0, 0, 72]
                            }
                        ],

                        // Họ tên được in sẵn dưới khoảng trống ký.
                        [
                            {
                                text: organizationSignerName || ' ',
                                bold: true,
                                alignment: 'center',
                                fontSize: 11
                            },
                            {
                                text: personalSignerName || ' ',
                                bold: true,
                                alignment: 'center',
                                fontSize: 11
                            }
                        ],

                        [
                            {
                                text: organizationSignerPosition || ' ',
                                alignment: 'center',
                                fontSize: 10,
                                margin: [0, 3, 0, 0]
                            },
                            {
                                text: ' '
                            }
                        ]
                    ]
                },

                layout: {
                    hLineWidth: () => 0,
                    vLineWidth: () => 0,
                    paddingLeft: column => column === 0 ? 0 : 9,
                    paddingRight: column => column === 0 ? 9 : 0,
                    paddingTop: () => 2,
                    paddingBottom: () => 2
                }
            },

            {
                columns: [
                    {
                        width: '*',
                        text: commitmentText,
                        fontSize: 10,
                        alignment: 'left'
                    },
                    {
                        width: '*',
                        text: ' '
                    }
                ],
                columnGap: 18,
                margin: [0, 12, 0, 0]
            }
        ]
    });

    // =====================================================
    // TRẢ VỀ CẤU HÌNH PDF — PHẦN BỊ THIẾU TRONG MÃ CŨ
    // =====================================================

    return {
        pageSize: 'LETTER',
        pageMargins: [72, 72, 72, 72],

        defaultStyle: {
            font: 'Roboto',
            fontSize: 11,
            lineHeight: 1.2
        },

        content,

        info: {
            title: 'Lý lịch khoa học - ' + (textValue(data.name) || 'Hồ sơ'),
            author: textValue(data.name)
        }
    };
}

    function makePdf(data) {
        if (!window.pdfMake) {
            throw new Error(
                'Chưa tải được thư viện PDF. ' +
                'Kiểm tra kết nối Internet rồi tải lại trang.'
            );
        }

        return window.pdfMake.createPdf(documentDefinition(data));
    }

    function pdfBlob(data) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(
                    'Tạo PDF quá thời gian chờ. ' +
                    'Kiểm tra thư viện PDF và font rồi thử lại.'
                ));
            }, 60000);

            try {
                makePdf(data).getBlob(blob => {
                    clearTimeout(timeout);

                    if (!(blob instanceof Blob)) {
                        reject(new Error('Không nhận được tệp PDF.'));
                        return;
                    }

                    resolve(blob);
                });
            } catch (error) {
                clearTimeout(timeout);
                reject(error);
            }
        });
    }

    async function withBusy(button, action) {
        button.disabled = true;

        try {
            await action();
        } catch (error) {
            notify(error.message || 'Không tạo được PDF.');
        } finally {
            button.disabled = false;
        }
    }

    $('savePdfBtn').onclick = event => {
        withBusy(event.currentTarget, async () => {
            if (!form.reportValidity()) return;

            const data = save();
            const blob = await pdfBlob(data);

            const name = (data.name || 'ho-so')
                .replace(/[^\p{L}\p{N}_-]/gu, '_');

            downloadBlob(blob, 'LLKH_' + name + '.pdf');

            notify('Đã lưu hồ sơ và tạo PDF.');
        });
    };

    $('previewBtn').onclick = event => {
        withBusy(event.currentTarget, async () => {
            if (!form.reportValidity()) return;

            const blob = await pdfBlob(collect());

            if (pdfUrl) URL.revokeObjectURL(pdfUrl);

            pdfUrl = URL.createObjectURL(blob);
            $('pdfFrame').src = pdfUrl;
            $('pdfDialog').showModal();
        });
    };

    $('closePdf').onclick = () => {
        $('pdfDialog').close();
    };

    // =========================================================
    // 5. ĐIỀU HƯỚNG
    // =========================================================

    const links = [
        ['task', 'Đăng ký nhiệm vụ'],
        ['personal', '01–08 · Thông tin cá nhân'],
        ...TABLES.map(table => [table.key, table.title]),
        ['other', '17. Kết quả khác'],
        ['sign', 'Xác nhận & chữ ký']
    ];

    links.forEach(([id, title]) => {
        $('nav').append(
            el('a', {
                href: '#' + id,
                textContent: title
            })
        );
    });

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                $('nav').querySelectorAll('a').forEach(link => {
                    link.classList.toggle(
                        'active',
                        link.getAttribute('href') ===
                            '#' + entry.target.id
                    );
                });
            });
        }, {
            rootMargin: '-10% 0px -75% 0px'
        });

        document.querySelectorAll('section.card').forEach(section => {
            observer.observe(section);
        });
    }

    // =========================================================
    // 6. SIDEBAR RESPONSIVE
    // Dùng với CSS responsive đã gửi.
    // =========================================================

    const sidebar = $('sidebar');
    const main = $('mainContent');
    const toggle = $('sidebarToggle');
    const close = $('sidebarClose');
    const backdrop = $('sidebarBackdrop');

    if (!sidebar || !main || !toggle || !close || !backdrop) {
        console.warn(
            'Thiếu phần tử sidebar. Kiểm tra sidebarToggle, ' +
            'sidebarClose, sidebarBackdrop và mainContent.'
        );
        return;
    }

    const mobile = window.matchMedia('(max-width: 1100px)');

    let desktopCollapsed = false;

    function updateSidebar() {
        const drawerOpen =
            mobile.matches &&
            document.body.classList.contains('sidebar-open');

        const expanded = mobile.matches
            ? drawerOpen
            : !desktopCollapsed;

        document.body.classList.toggle(
            'sidebar-collapsed',
            !mobile.matches && desktopCollapsed
        );

        toggle.setAttribute('aria-expanded', String(expanded));
        toggle.setAttribute(
            'aria-label',
            expanded ? 'Thu gọn menu' : 'Mở menu'
        );

        sidebar.inert = !expanded;
        sidebar.setAttribute('aria-hidden', String(!expanded));

        main.inert = drawerOpen;

        if (drawerOpen) {
            sidebar.setAttribute('role', 'dialog');
            sidebar.setAttribute('aria-modal', 'true');
        } else {
            sidebar.removeAttribute('role');
            sidebar.removeAttribute('aria-modal');
        }
    }

    function closeDrawer() {
        document.body.classList.remove('sidebar-open');

        updateSidebar();

        toggle.focus({ preventScroll: true });
    }

    toggle.addEventListener('click', () => {
        if (mobile.matches) {
            document.body.classList.toggle('sidebar-open');

            updateSidebar();

            if (document.body.classList.contains('sidebar-open')) {
                close.focus({ preventScroll: true });
            }
        } else {
            desktopCollapsed = !desktopCollapsed;
            updateSidebar();
        }
    });

    close.addEventListener('click', closeDrawer);
    backdrop.addEventListener('click', closeDrawer);

    sidebar.addEventListener('click', event => {
        if (
            mobile.matches &&
            event.target.closest('a[href^="#"]')
        ) {
            closeDrawer();
        }
    });

    document.addEventListener('keydown', event => {
        if (
            !mobile.matches ||
            !document.body.classList.contains('sidebar-open')
        ) {
            return;
        }

        if (event.key === 'Escape') {
            event.preventDefault();
            closeDrawer();
            return;
        }

        if (event.key !== 'Tab') return;

        const items = [
            ...sidebar.querySelectorAll(
                'a[href], button:not([disabled]), [tabindex="0"]'
            )
        ].filter(node => node.getClientRects().length > 0);

        if (!items.length) return;

        const first = items[0];
        const last = items[items.length - 1];

        if (
            event.shiftKey &&
            document.activeElement === first
        ) {
            event.preventDefault();
            last.focus();
        } else if (
            !event.shiftKey &&
            document.activeElement === last
        ) {
            event.preventDefault();
            first.focus();
        }
    });

    mobile.addEventListener('change', () => {
        const focusWasInSidebar =
            sidebar.contains(document.activeElement);

        document.body.classList.remove('sidebar-open');

        updateSidebar();

        if (focusWasInSidebar && sidebar.inert) {
            toggle.focus({ preventScroll: true });
        }
    });

    updateSidebar();
})();