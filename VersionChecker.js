import React, { useEffect, useState } from 'react';

// Language translations
const translations = {
    en: {
        newVersionAvailable: "New Application Version Available",
        currentVersion: "Current version:",
        newVersion: "New version:",
        description: "Description:",
        update: "Update",
        versionSuffix: "is the interface version."
    },
    tr: {
        newVersionAvailable: "Yeni Uygulama Versiyonu Mevcut",
        currentVersion: "Mevcut versiyon:",
        newVersion: "Yeni versiyon:",
        description: "Açıklama:",
        update: "Güncelle",
        versionSuffix: "arayüz sürümüdür."
    },
    zh: {
        newVersionAvailable: "新应用版本可用",
        currentVersion: "当前版本：",
        newVersion: "新版本：",
        description: "描述：",
        update: "更新",
        versionSuffix: "是界面版本。"
    },
    fr: {
        newVersionAvailable: "Nouvelle Version de l'Application Disponible",
        currentVersion: "Version actuelle :",
        newVersion: "Nouvelle version :",
        description: "Description :",
        update: "Mettre à jour",
        versionSuffix: "est la version de l'interface."
    },
    de: {
        newVersionAvailable: "Neue Anwendungsversion Verfügbar",
        currentVersion: "Aktuelle Version:",
        newVersion: "Neue Version:",
        description: "Beschreibung:",
        update: "Aktualisieren",
        versionSuffix: "ist die Schnittstellenversion."
    }
};

// Shared styles object
const styles = {
    // Common styles
    backdrop: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    },
    title: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '16px',
        fontWeight: 600,
        color: '#333'
    },
    icon: {
        marginRight: '10px',
        color: '#1890ff'
    },
    closeButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#999',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px',
        borderRadius: '4px',
        transition: 'background-color 0.2s'
    },
    description: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    versionItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },
    label: {
        fontWeight: 600,
        fontSize: '14px',
        color: '#333'
    },
    currentVersion: {
        color: '#ff4d4f',
        fontWeight: 600
    },
    newVersion: {
        color: '#0017ff'
    },
    versionDescription: {
        color: '#0017ff',
        marginTop: '4px',
        lineHeight: 1.5
    },
    updateButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: '#1890ff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '8px 16px',
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'background-color 0.2s'
    },
    buttonIcon: {
        display: 'flex',
        alignItems: 'center'
    },
    versionFooter: {
        width: '100%',
        fontSize: '9px',
        height: '55px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'black'
    },

    // Modal-specific styles
    modal: {
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        width: '90%',
        maxWidth: '500px',
        display: 'flex',
        flexDirection: 'column'
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid #f0f0f0'
    },
    modalContent: {
        padding: '20px'
    },
    modalFooter: {
        padding: '16px 20px',
        borderTop: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'flex-end'
    },

    // Card-specific styles
    card: {
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        width: '100%',
        maxWidth: '350px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #f0f0f0',
        position: 'relative',
        zIndex: 1000
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: '#f5f5f5',
        borderBottom: '1px solid #f0f0f0'
    },
    cardContent: {
        padding: '16px'
    },
    cardFooter: {
        padding: '12px 16px',
        backgroundColor: '#f5f5f5',
        borderTop: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'center'
    },
    cardUpdateButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: '#1890ff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '8px 16px',
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        width: '100%',
        justifyContent: 'center'
    }
};

// SVG Icons as component functions
const Icons = {
    Info: ({ width = 22, height = 22 }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
    ),
    Close: ({ width = 20, height = 20 }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    ),
    Refresh: ({ width = 16, height = 16 }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 4v6h-6"></path>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
        </svg>
    )
};

// Subcomponent for version details
const VersionDetails = ({ t, currentVersion, latestVersion, latestDescription, styles }) => (
    <div style={styles.description}>
        <div style={styles.versionItem}>
            <label style={styles.label}>{t.currentVersion}</label>
            <span style={styles.currentVersion}>{currentVersion}</span>
        </div>
        <div style={styles.versionItem}>
            <label style={styles.label}>{t.newVersion}</label>
            <span style={styles.newVersion}>{latestVersion}</span>
        </div>
        <div style={styles.versionItem}>
            <label style={styles.label}>{t.description}</label>
            <span style={styles.versionDescription}>{latestDescription}</span>
        </div>
    </div>
);

// Modal component
const Modal = ({
                   t,
                   styles,
                   onClose,
                   currentVersion,
                   latestVersion,
                   latestDescription,
                   onUpdate,
                   CustomModalContent
               }) => {
    return (
        <div style={styles.backdrop}>
            <div style={styles.modal}>
                <div style={styles.modalHeader}>
                    <div style={styles.title}>
                        <div style={styles.icon}>
                            <Icons.Info />
                        </div>
                        <span>{t.newVersionAvailable}</span>
                    </div>
                    <button
                        style={styles.closeButton}
                        onClick={onClose}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#f5f5f5';
                            e.currentTarget.style.color = '#666';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#999';
                        }}
                    >
                        <Icons.Close />
                    </button>
                </div>
                <div style={styles.modalContent}>
                    {CustomModalContent ? (
                        <CustomModalContent
                            t={t}
                            styles={styles}
                            currentVersion={currentVersion}
                            latestVersion={latestVersion}
                            latestDescription={latestDescription}
                        />
                    ) : (
                        <VersionDetails
                            t={t}
                            styles={styles}
                            currentVersion={currentVersion}
                            latestVersion={latestVersion}
                            latestDescription={latestDescription}
                        />
                    )}
                </div>
                <div style={styles.modalFooter}>
                    <button
                        style={styles.updateButton}
                        onClick={onUpdate}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#40a9ff';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#1890ff';
                        }}
                    >
                        <span style={styles.buttonIcon}>
                            <Icons.Refresh />
                        </span>
                        {t.update}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Card component
const Card = ({
                  t,
                  styles,
                  onClose,
                  currentVersion,
                  latestVersion,
                  latestDescription,
                  onUpdate,
                  CustomCardContent
              }) => {
    return (
        <div id="version-checker-card" style={styles.card}>
            <div style={styles.cardHeader}>
                <div style={styles.title}>
                    <div style={styles.icon}>
                        <Icons.Info width={18} height={18} />
                    </div>
                    <span>{t.newVersionAvailable}</span>
                </div>
                <button
                    style={styles.closeButton}
                    onClick={onClose}
                    onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#e8e8e8';
                        e.currentTarget.style.color = '#666';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#999';
                    }}
                >
                    <Icons.Close width={16} height={16} />
                </button>
            </div>
            <div style={styles.cardContent}>
                {CustomCardContent ? (
                    <CustomCardContent
                        t={t}
                        styles={styles}
                        currentVersion={currentVersion}
                        latestVersion={latestVersion}
                        latestDescription={latestDescription}
                    />
                ) : (
                    <VersionDetails
                        t={t}
                        styles={styles}
                        currentVersion={currentVersion}
                        latestVersion={latestVersion}
                        latestDescription={latestDescription}
                    />
                )}
            </div>
            <div style={styles.cardFooter}>
                <button
                    style={styles.cardUpdateButton}
                    onClick={onUpdate}
                    onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#40a9ff';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#1890ff';
                    }}
                >
                    <span style={styles.buttonIcon}>
                        <Icons.Refresh width={16} height={16} />
                    </span>
                    {t.update}
                </button>
            </div>
        </div>
    );
};

// Main VersionChecker component
const VersionChecker = ({
                            type = 'modal',
                            lang = 'en',
                            customStyles = {},
                            CustomModalContent = null,
                            CustomCardContent = null,
                            CustomModal = null,
                            CustomCard = null
                        }) => {
    const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
    const [currentVersion, setCurrentVersion] = useState(null);
    const [latestVersion, setLatestVersion] = useState(null);
    const [latestDescription, setLatestDescription] = useState("");
    const [modalVisible, setModalVisible] = useState(false);

    // Merge default styles with custom styles
    const mergedStyles = { ...styles, ...customStyles };

    // Get translations for the selected language (fallback to English if translation not available)
    const t = translations[lang] || translations.en;

    useEffect(() => {
        // Check for version updates on component mount and every 15 minutes
        checkForUpdates();
        const intervalId = setInterval(checkForUpdates, 15 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, []);

    // Document click handler for card type - only for card, not for modal
    useEffect(() => {
        // Only add the document click handler when card is visible
        if (type === 'card' && isUpdateAvailable && modalVisible) {
            const handleClickOutside = (event) => {
                // Get a reference to the card element
                const cardElement = document.getElementById('version-checker-card');

                // Close if click is outside the card
                if (cardElement && !cardElement.contains(event.target)) {
                    setModalVisible(false);
                }
            };

            // Add event listener
            document.addEventListener('mousedown', handleClickOutside);

            // Clean up
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [type, isUpdateAvailable, modalVisible]);

    const checkForUpdates = async () => {
        try {
            // Get the current version from localStorage (if exists)
            const storedVersion = localStorage.getItem('appVersion');

            // Fetch the latest version from the server with cache-busting headers
            const response = await fetch('/version.json?t=' + new Date().getTime(), {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch version information');
            }

            const versionData = await response.json();
            setLatestVersion(versionData.version);
            setLatestDescription(versionData.description);

            // If this is the first visit, store the version
            if (!storedVersion) {
                localStorage.setItem('appVersion', versionData.version);
                setCurrentVersion(versionData.version);
                return;
            }

            setCurrentVersion(storedVersion);

            // Check if versions are different
            if (storedVersion !== versionData.version) {
                setIsUpdateAvailable(true);
                setModalVisible(true);
            }
        } catch (error) {
            console.error('Version check failed:', error);
        }
    };

    const handleUpdate = () => {
        window.localStorage.removeItem('tabId');

        if ('caches' in window) {
            caches.keys().then((cacheNames) => {
                cacheNames.forEach((cacheName) => {
                    caches.delete(cacheName);
                });
            });
        }

        // Update stored version
        if (latestVersion) {
            localStorage.setItem('appVersion', latestVersion);
        }

        // Set cache-disabling meta tags
        const metaCache = document.createElement('meta');
        metaCache.httpEquiv = 'Cache-Control';
        metaCache.content = 'no-cache, no-store, must-revalidate';
        document.head.appendChild(metaCache);

        const metaPragma = document.createElement('meta');
        metaPragma.httpEquiv = 'Pragma';
        metaPragma.content = 'no-cache';
        document.head.appendChild(metaPragma);

        const metaExpires = document.createElement('meta');
        metaExpires.httpEquiv = 'Expires';
        metaExpires.content = '0';
        document.head.appendChild(metaExpires);

        // Reload the page to get the latest version with cache disabled
        window.location.reload(true);
    };

    // Handler for closing the modal/card
    const handleClose = () => {
        setModalVisible(false);
    };

    // Render the appropriate component based on type
    const renderComponent = () => {
        if (type === 'modal') {
            return CustomModal ? (
                <CustomModal
                    t={t}
                    styles={mergedStyles}
                    onClose={handleClose}
                    onUpdate={handleUpdate}
                    currentVersion={currentVersion}
                    latestVersion={latestVersion}
                    latestDescription={latestDescription}
                />
            ) : (
                <Modal
                    t={t}
                    styles={mergedStyles}
                    onClose={handleClose}
                    onUpdate={handleUpdate}
                    currentVersion={currentVersion}
                    latestVersion={latestVersion}
                    latestDescription={latestDescription}
                    CustomModalContent={CustomModalContent}
                />
            );
        } else {
            return CustomCard ? (
                <CustomCard
                    t={t}
                    styles={mergedStyles}
                    onClose={handleClose}
                    onUpdate={handleUpdate}
                    currentVersion={currentVersion}
                    latestVersion={latestVersion}
                    latestDescription={latestDescription}
                />
            ) : (
                <Card
                    t={t}
                    styles={mergedStyles}
                    onClose={handleClose}
                    onUpdate={handleUpdate}
                    currentVersion={currentVersion}
                    latestVersion={latestVersion}
                    latestDescription={latestDescription}
                    CustomCardContent={CustomCardContent}
                />
            );
        }
    };

    return (
        <>
            {isUpdateAvailable && modalVisible && renderComponent()}

            <div style={mergedStyles.versionFooter}>
                {currentVersion && `${currentVersion} ${t.versionSuffix}`}
            </div>
        </>
    );
};

export default VersionChecker;
