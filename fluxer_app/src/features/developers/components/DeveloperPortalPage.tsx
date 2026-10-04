// SPDX-License-Identifier: AGPL-3.0-or-later

import {SettingsModalHeader} from '@app/features/app/components/dialogs/components/SettingsModalHeader';
import {SettingsCurrentTabProvider} from '@app/features/app/components/dialogs/shared/SettingsCurrentTabContext';
import {
	SettingsModalContainer,
	SettingsModalDesktopContent,
	SettingsModalDesktopScroll,
	SettingsModalDesktopSidebar,
	SettingsModalSidebarCategory,
	SettingsModalSidebarCategoryTitle,
	SettingsModalSidebarItem,
	SettingsModalSidebarNav,
} from '@app/features/app/components/dialogs/shared/SettingsModalLayout';
import {SettingsPillTabs} from '@app/features/app/components/dialogs/shared/SettingsPillTabs';
import {FLUXER_DOCS_URL} from '@app/features/app/config/I18nDisplayConstants';
import styles from '@app/features/developers/components/DeveloperPortalPage.module.css';
import {DeveloperPortalPaths, type DeveloperPortalSection} from '@app/features/developers/DeveloperPortalPaths';
import {transitionTo} from '@app/features/navigation/utils/RouterUtils';
import {openExternalUrl} from '@app/features/ui/utils/NativeUtils';
import ApplicationsTab from '@app/features/user/components/modals/tabs/applications_tab';
import ApplicationsTabState from '@app/features/user/components/modals/tabs/applications_tab/ApplicationsTabState';
import ClientDeveloperSettingsTab from '@app/features/user/components/modals/tabs/ClientDeveloperSettingsTab';
import ComponentGalleryTab from '@app/features/user/components/modals/tabs/component_gallery_tab';
import EmbedDebuggerTab from '@app/features/user/components/modals/tabs/EmbedDebuggerTab';
import {SettingsContentKeyProvider} from '@app/features/user/hooks/useSettingsContentKey';
import {useUnsavedChangesFlash} from '@app/features/user/hooks/useUnsavedChangesFlash';
import UserSettings from '@app/features/user/state/UserSettings';
import {msg} from '@lingui/core/macro';
import {Trans, useLingui} from '@lingui/react/macro';
import {
	AppWindowIcon,
	ArrowLeftIcon,
	ArrowSquareOutIcon,
	BookOpenIcon,
	CaretRightIcon,
	CodeIcon,
	PuzzlePieceIcon,
	SlidersHorizontalIcon,
	SquaresFourIcon,
} from '@phosphor-icons/react';
import {observer} from 'mobx-react-lite';
import type React from 'react';
import {useCallback, useEffect, useMemo, useState} from 'react';

const APPLICATIONS_UNSAVED_TAB = 'applications';
const APPLICATION_SECTIONS_DESCRIPTOR = msg({
	message: 'Application sections',
	comment: 'Accessible label for the pill tabs that jump between sections of an application in the developer portal.',
});

interface DeveloperPortalPageProps {
	section: DeveloperPortalSection;
	appId?: string;
}

interface DetailPill {
	id: string;
	label: string;
}

/** Pills for the sections of an application's detail page, built from the rendered section cards. */
function useDetailSectionPills(scrollEl: HTMLElement | null, enabled: boolean, contentKey: string) {
	const [pills, setPills] = useState<Array<DetailPill>>([]);
	const [activeId, setActiveId] = useState<string | null>(null);
	const getCards = useCallback((): Array<HTMLElement> => {
		if (!scrollEl) return [];
		return Array.from(scrollEl.querySelectorAll<HTMLElement>('section')).filter((el) =>
			el.querySelector(':scope > div h3'),
		);
	}, [scrollEl]);
	useEffect(() => {
		if (!enabled || !scrollEl) {
			setPills([]);
			return;
		}
		const collect = () => {
			const next = getCards().map((el, index) => ({
				id: `portal-section-${index}`,
				label: el.querySelector('h3')?.textContent?.trim() ?? '',
			}));
			setPills((prev) =>
				prev.length === next.length && prev.every((p, i) => p.label === next[i].label) ? prev : next,
			);
		};
		collect();
		const observer = new MutationObserver(collect);
		observer.observe(scrollEl, {childList: true, subtree: true});
		return () => observer.disconnect();
	}, [enabled, scrollEl, getCards, contentKey]);
	useEffect(() => {
		if (!enabled || !scrollEl) return;
		const onScroll = () => {
			const cards = getCards();
			const top = scrollEl.getBoundingClientRect().top + 72;
			let current = 0;
			cards.forEach((card, index) => {
				if (card.getBoundingClientRect().top <= top) current = index;
			});
			if (scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 4 && cards.length > 0) {
				current = cards.length - 1;
			}
			setActiveId(`portal-section-${current}`);
		};
		onScroll();
		scrollEl.addEventListener('scroll', onScroll, {passive: true});
		return () => scrollEl.removeEventListener('scroll', onScroll);
	}, [enabled, scrollEl, getCards, pills]);
	const scrollToPill = useCallback(
		(id: string) => {
			const index = Number(id.replace('portal-section-', ''));
			const card = getCards()[index];
			if (!card || !scrollEl) return;
			const offset = card.getBoundingClientRect().top - scrollEl.getBoundingClientRect().top + scrollEl.scrollTop;
			scrollEl.scrollTo({top: Math.max(0, offset - 16), behavior: 'smooth'});
			setActiveId(id);
		},
		[getCards, scrollEl],
	);
	return {pills, activeId, scrollToPill};
}

export const DeveloperPortalPage: React.FC<DeveloperPortalPageProps> = observer(({section, appId}) => {
	const {i18n} = useLingui();
	const store = ApplicationsTabState;
	const developerMode = UserSettings.developerMode;
	const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);
	const {showUnsavedBanner, flashBanner, tabData, checkUnsavedChanges} = useUnsavedChangesFlash(
		section === 'applications' ? APPLICATIONS_UNSAVED_TAB : section,
	);

	// Keep the URL and the applications store in step, both ways.
	useEffect(() => {
		if (section !== 'applications') return;
		if (appId) {
			if (store.selectedAppId !== appId) void store.navigateToDetail(appId);
		} else if (store.isDetailView) {
			void store.navigateToList();
		}
	}, [section, appId, store]);
	const selectedAppId = store.isDetailView ? store.selectedAppId : null;
	useEffect(() => {
		if (section !== 'applications') return;
		if (selectedAppId && selectedAppId !== appId) {
			transitionTo(DeveloperPortalPaths.application(selectedAppId));
		} else if (!selectedAppId && appId && store.isListView) {
			transitionTo(DeveloperPortalPaths.APPLICATIONS);
		}
	}, [section, selectedAppId, appId, store.isListView]);

	const go = useCallback(
		(path: string) => {
			if (checkUnsavedChanges()) return;
			transitionTo(path);
		},
		[checkUnsavedChanges],
	);
	const leavePortal = useCallback(() => go('/channels/@me'), [go]);

	const isDetail = section === 'applications' && Boolean(appId) && store.isDetailView;
	const detailName = store.selectedApplication?.name;
	const contentKey = `${section}-${appId ?? 'list'}`;
	const {pills, activeId, scrollToPill} = useDetailSectionPills(scrollEl, isDetail, contentKey);

	const title = useMemo(() => {
		switch (section) {
			case 'options':
				return <Trans>Developer options</Trans>;
			case 'embed_debugger':
				return <Trans>Embed debugger</Trans>;
			case 'component_gallery':
				return <Trans>Component gallery</Trans>;
			default:
				return isDetail ? (
					<span className={styles.breadcrumb} data-flx="developers.portal.breadcrumb">
						<button
							type="button"
							className={styles.breadcrumbParent}
							onClick={() => go(DeveloperPortalPaths.APPLICATIONS)}
							data-flx="developers.portal.breadcrumb.applications"
						>
							<Trans>Applications</Trans>
						</button>
						<CaretRightIcon size={14} weight="bold" className={styles.breadcrumbChevron} aria-hidden />
						<span className={styles.breadcrumbCurrent}>{detailName ?? <Trans>Application</Trans>}</span>
					</span>
				) : (
					<Trans>Applications</Trans>
				);
		}
	}, [section, isDetail, detailName, go]);

	const headerTabs =
		pills.length > 1 ? (
			<SettingsPillTabs
				items={pills}
				activeId={activeId}
				onSelect={scrollToPill}
				ariaLabel={i18n._(APPLICATION_SECTIONS_DESCRIPTOR)}
				data-flx="developers.portal.section-pills"
			/>
		) : null;

	const sidebarHeader = (
		<div className={styles.brand} data-flx="developers.portal.brand">
			<div className={styles.brandMark} aria-hidden>
				<CodeIcon size={16} weight="bold" />
			</div>
			<div className={styles.brandText}>
				<div className={styles.brandTitle}>
					<Trans>Developer portal</Trans>
				</div>
				<div className={styles.brandSubtitle}>
					<Trans>Build on Delight</Trans>
				</div>
			</div>
		</div>
	);
	const sidebarFooter = (
		<div className={styles.sidebarFooter} data-flx="developers.portal.sidebar-footer">
			<button type="button" className={styles.backLink} onClick={leavePortal} data-flx="developers.portal.back">
				<ArrowLeftIcon size={14} weight="bold" aria-hidden />
				<Trans>Back to Delight</Trans>
			</button>
		</div>
	);

	let content: React.ReactNode;
	switch (section) {
		case 'options':
			content = <ClientDeveloperSettingsTab data-flx="developers.portal.options" />;
			break;
		case 'embed_debugger':
			content = <EmbedDebuggerTab data-flx="developers.portal.embed-debugger" />;
			break;
		case 'component_gallery':
			content = <ComponentGalleryTab data-flx="developers.portal.component-gallery" />;
			break;
		default:
			content = <ApplicationsTab data-flx="developers.portal.applications" />;
	}

	return (
		<SettingsContentKeyProvider data-flx="developers.portal.content-key-provider">
			<div className={styles.page} data-flx="developers.portal.page">
				<SettingsModalContainer data-flx="developers.portal.container">
					<SettingsModalDesktopSidebar data-flx="developers.portal.sidebar">
						<SettingsModalSidebarNav header={sidebarHeader} footer={sidebarFooter} data-flx="developers.portal.nav">
							<SettingsModalSidebarCategory data-flx="developers.portal.category.build">
								<SettingsModalSidebarCategoryTitle data-flx="developers.portal.category.build.title">
									<Trans>Build</Trans>
								</SettingsModalSidebarCategoryTitle>
								<SettingsModalSidebarItem
									icon={AppWindowIcon}
									label={<Trans>Applications</Trans>}
									selected={section === 'applications'}
									onClick={() => go(DeveloperPortalPaths.APPLICATIONS)}
									id="developer-portal-tab-applications"
									controlsId="developer-portal-panel"
									data-flx="developers.portal.item.applications"
								/>
							</SettingsModalSidebarCategory>
							<SettingsModalSidebarCategory data-flx="developers.portal.category.tools">
								<SettingsModalSidebarCategoryTitle data-flx="developers.portal.category.tools.title">
									<Trans>Tools</Trans>
								</SettingsModalSidebarCategoryTitle>
								<SettingsModalSidebarItem
									icon={SlidersHorizontalIcon}
									label={<Trans>Developer options</Trans>}
									selected={section === 'options'}
									onClick={() => go(DeveloperPortalPaths.OPTIONS)}
									id="developer-portal-tab-options"
									controlsId="developer-portal-panel"
									data-flx="developers.portal.item.options"
								/>
								{developerMode && (
									<SettingsModalSidebarItem
										icon={PuzzlePieceIcon}
										label={<Trans>Embed debugger</Trans>}
										selected={section === 'embed_debugger'}
										onClick={() => go(DeveloperPortalPaths.EMBED_DEBUGGER)}
										id="developer-portal-tab-embed-debugger"
										controlsId="developer-portal-panel"
										data-flx="developers.portal.item.embed-debugger"
									/>
								)}
								{developerMode && (
									<SettingsModalSidebarItem
										icon={SquaresFourIcon}
										label={<Trans>Component gallery</Trans>}
										selected={section === 'component_gallery'}
										onClick={() => go(DeveloperPortalPaths.COMPONENT_GALLERY)}
										id="developer-portal-tab-component-gallery"
										controlsId="developer-portal-panel"
										data-flx="developers.portal.item.component-gallery"
									/>
								)}
							</SettingsModalSidebarCategory>
							<SettingsModalSidebarCategory data-flx="developers.portal.category.resources">
								<SettingsModalSidebarCategoryTitle data-flx="developers.portal.category.resources.title">
									<Trans>Resources</Trans>
								</SettingsModalSidebarCategoryTitle>
								<SettingsModalSidebarItem
									icon={BookOpenIcon}
									label={
										<span className={styles.externalLabel}>
											<Trans>Documentation</Trans>
											<ArrowSquareOutIcon size={14} weight="bold" className={styles.externalIcon} aria-hidden />
										</span>
									}
									onClick={() => void openExternalUrl(FLUXER_DOCS_URL)}
									data-flx="developers.portal.item.docs"
								/>
							</SettingsModalSidebarCategory>
						</SettingsModalSidebarNav>
					</SettingsModalDesktopSidebar>
					<SettingsModalDesktopContent tabpanelId="developer-portal-panel" data-flx="developers.portal.content">
						<SettingsModalHeader
							title={title}
							showUnsavedBanner={showUnsavedBanner}
							flashBanner={flashBanner}
							tabData={tabData}
							onClose={leavePortal}
							tabs={headerTabs}
							data-flx="developers.portal.header"
						/>
						<SettingsModalDesktopScroll scrollKey={contentKey} scrollerRef={setScrollEl} data-flx="developers.portal.scroll">
							<SettingsCurrentTabProvider value={null} data-flx="developers.portal.current-tab">
								{content}
							</SettingsCurrentTabProvider>
						</SettingsModalDesktopScroll>
					</SettingsModalDesktopContent>
				</SettingsModalContainer>
			</div>
		</SettingsContentKeyProvider>
	);
});
