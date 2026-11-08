<template>
  <div class="checkout-page">
    <div class="page-container">
      <div class="breadcrumb">
        <NuxtLink to="/">Beranda</NuxtLink>
        <span>/</span>
        <span class="active">Checkout</span>
      </div>

      <div class="page-header">
        <h1 class="page-title">Checkout Pengajuan Pesanan</h1>
        <p class="page-subtitle">
          Lengkapi alamat pengiriman dan periksa rincian barang. Instruksi transfer akan dibuka setelah pesanan di-ACC oleh Admin.
        </p>
      </div>

      <form class="checkout-layout" novalidate @submit.prevent="handleCreateOrder">
        <!-- Left: Address Form (design_address.md) & Order Items -->
        <div class="checkout-form-col">
          <!-- Error Summary (role="alert") -->
          <div v-if="errorSummaryList.length > 0" ref="errorSummaryRef" class="error-summary-box" role="alert" tabindex="-1">
            <strong>Mohon periksa kembali data berikut:</strong>
            <ul>
              <li v-for="err in errorSummaryList" :key="err.field">
                <a :href="`#field-${err.field}`" @click.prevent="focusField(err.field)">{{ err.message }}</a>
              </li>
            </ul>
          </div>

          <!-- 1. Alamat Pengiriman (design_address.md) -->
          <div class="section-box">
            <div class="box-head-flex">
              <h2 class="box-title" style="margin-bottom: 0">Alamat Pengiriman</h2>
            </div>

            <!-- Address Section -->
            <div class="address-form-body">
              <!-- Saved Addresses (Logged-in Customers) -->
              <div v-if="savedAddresses.length > 0" class="saved-addresses-section">
                <div class="saved-header">
                  <span class="saved-label">Alamat Tersimpan</span>
                  <button
                    v-if="!useCustomAddress"
                    type="button"
                    class="btn-use-other-addr"
                    @click="switchToCustomAddress"
                  >
                    Gunakan alamat lain
                  </button>
                  <button
                    v-else
                    type="button"
                    class="btn-use-other-addr"
                    @click="selectSavedAddress(savedAddresses[0])"
                  >
                    Pilih dari alamat tersimpan
                  </button>
                </div>

                <div v-if="!useCustomAddress" class="saved-list">
                  <label
                    v-for="addr in savedAddresses"
                    :key="addr.id"
                    class="saved-addr-card"
                    :class="{ selected: selectedSavedId === addr.id }"
                  >
                    <input
                      type="radio"
                      name="savedAddress"
                      :value="addr.id"
                      :checked="selectedSavedId === addr.id"
                      @change="selectSavedAddress(addr)"
                    />
                    <div class="saved-addr-info">
                      <div class="saved-addr-top">
                        <strong>{{ addr.recipient_name }}</strong>
                        <span>{{ addr.phone }}</span>
                        <span v-if="addr.is_default" class="default-pill">Terakhir Dipakai</span>
                      </div>
                      <p class="saved-addr-street">{{ addr.street }}</p>
                      <span class="saved-addr-region">
                        {{ [addr.village_name ? `Kel. ${addr.village_name}` : null, `Kec. ${addr.district_name}`, addr.regency_name, addr.province_name, addr.postal_code].filter(Boolean).join(', ') }}
                      </span>
                      <span v-if="addr.courier_note" class="saved-addr-note">Catatan kurir: {{ addr.courier_note }}</span>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Manual / Cascading Address Form -->
              <div v-show="useCustomAddress || savedAddresses.length === 0" class="address-fields-grid">
                <!-- Field 1: Nama penerima -->
                <div class="form-field full-span">
                  <label for="field-recipient_name">Nama penerima <span class="req-tag">(wajib)</span></label>
                  <input
                    id="field-recipient_name"
                    v-model="recipientName"
                    type="text"
                    autocomplete="name"
                    placeholder="Nama lengkap penerima"
                    :aria-invalid="!!fieldErrors.recipient_name"
                    :aria-describedby="fieldErrors.recipient_name ? 'err-recipient_name' : undefined"
                    @blur="validateField('recipient_name')"
                  />
                  <span v-if="fieldErrors.recipient_name" id="err-recipient_name" class="field-error">
                    {{ fieldErrors.recipient_name }}
                  </span>
                </div>

                <!-- Field 2: Nomor HP -->
                <div class="form-field full-span">
                  <label for="field-phone">Nomor HP <span class="req-tag">(wajib)</span></label>
                  <input
                    id="field-phone"
                    v-model="recipientPhone"
                    type="tel"
                    autocomplete="tel"
                    placeholder="081234567890"
                    :aria-invalid="!!fieldErrors.phone"
                    :aria-describedby="fieldErrors.phone ? 'err-phone' : 'hint-phone'"
                    @blur="handlePhoneBlur"
                  />
                  <span id="hint-phone" class="field-hint">Format 08…, 628…, atau +628… (otomatis disimpan sebagai 628…)</span>
                  <span v-if="fieldErrors.phone" id="err-phone" class="field-error">
                    {{ fieldErrors.phone }}
                  </span>
                </div>

                <!-- Optional Single Search Box ("Cari kecamatan atau kelurahan") -->
                <div class="form-field full-span quick-search-wrap">
                  <label for="field-quick_search">Cari kecamatan atau kelurahan <span class="opt-tag">(opsional — isi cepat)</span></label>
                  <div class="quick-search-box">
                    <input
                      id="field-quick_search"
                      v-model="quickSearchQuery"
                      type="text"
                      placeholder="Ketik min. 3 huruf, cth: Tegalsari, Pasar Baru, Lubuk Baja..."
                      autocomplete="off"
                      @input="handleQuickSearchInput"
                      @focus="quickSearchOpen = quickSearchResults.length > 0"
                    />
                    <span v-if="quickSearchLoading" class="quick-loading">Memuat…</span>
                    <ul v-if="quickSearchOpen && quickSearchResults.length > 0" class="quick-results-list" role="listbox">
                      <li
                        v-for="item in quickSearchResults"
                        :key="`${item.district_code}-${item.village_code || ''}`"
                        role="option"
                        class="quick-result-item"
                        @mousedown.prevent="applyQuickSearchResult(item)"
                      >
                        <strong>{{ item.label }}</strong>
                        <span v-if="item.postal_code" class="quick-postal">{{ item.postal_code }}</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <!-- Field 3: Provinsi (Combobox) -->
                <div class="form-field">
                  <label for="field-province_code">Provinsi <span class="req-tag">(wajib)</span></label>
                  <div class="combobox-container">
                    <input
                      id="field-province_code"
                      v-model="combText.province"
                      type="text"
                      role="combobox"
                      :aria-expanded="activeCombo === 'province'"
                      aria-controls="listbox-province"
                      :aria-activedescendant="activeCombo === 'province' && highlightedIndex >= 0 ? `opt-province-${highlightedIndex}` : undefined"
                      :aria-invalid="!!fieldErrors.province_code"
                      :aria-describedby="fieldErrors.province_code ? 'err-province_code' : undefined"
                      :placeholder="loadingLevel.province ? 'Memuat…' : 'Pilih provinsi'"
                      :disabled="loadingLevel.province"
                      autocomplete="off"
                      @focus="openCombo('province')"
                      @input="onComboInput('province')"
                      @keydown="onComboKeydown($event, 'province')"
                      @blur="onComboBlur('province')"
                    />
                    <span class="combo-chevron" aria-hidden="true">▾</span>

                    <div
                      v-if="activeCombo === 'province'"
                      class="combo-sheet-backdrop"
                      @mousedown.self="closeCombo"
                    >
                      <div class="combo-dropdown" :class="{ 'is-mobile-sheet': isMobileViewport }">
                        <div v-if="isMobileViewport" class="sheet-header">
                          <strong>Pilih provinsi</strong>
                          <button type="button" class="sheet-close" @click="closeCombo">&times;</button>
                        </div>
                        <div v-if="isMobileViewport" class="sheet-search-bar">
                          <input
                            v-model="combFilter.province"
                            type="text"
                            placeholder="Cari provinsi..."
                            autocomplete="off"
                          />
                        </div>
                        <ul id="listbox-province" role="listbox" class="combo-options">
                          <li v-if="filteredProvinces.length === 0" class="combo-empty">
                            Tidak ditemukan. Periksa ejaan atau coba kata lain.
                          </li>
                          <li
                            v-for="(item, idx) in filteredProvinces"
                            :id="`opt-province-${idx}`"
                            :key="item.code"
                            role="option"
                            :aria-selected="provinceCode === item.code"
                            class="combo-option"
                            :class="{ highlighted: idx === highlightedIndex, selected: provinceCode === item.code }"
                            @mousedown.prevent="selectComboOption('province', item)"
                          >
                            {{ item.name }}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <span v-if="fieldErrors.province_code" id="err-province_code" class="field-error">
                    {{ fieldErrors.province_code }}
                  </span>
                </div>

                <!-- Field 4: Kota / Kabupaten (Combobox) -->
                <div class="form-field">
                  <label for="field-regency_code">Kota / Kabupaten <span class="req-tag">(wajib)</span></label>
                  <div class="combobox-container">
                    <input
                      id="field-regency_code"
                      v-model="combText.regency"
                      type="text"
                      role="combobox"
                      :aria-expanded="activeCombo === 'regency'"
                      aria-controls="listbox-regency"
                      :aria-activedescendant="activeCombo === 'regency' && highlightedIndex >= 0 ? `opt-regency-${highlightedIndex}` : undefined"
                      :aria-invalid="!!fieldErrors.regency_code"
                      :aria-describedby="!provinceCode ? 'hint-regency-disabled' : fieldErrors.regency_code ? 'err-regency_code' : undefined"
                      :placeholder="loadingLevel.regency ? 'Memuat…' : 'Pilih kota / kabupaten'"
                      :disabled="!provinceCode || loadingLevel.regency"
                      autocomplete="off"
                      @focus="openCombo('regency')"
                      @input="onComboInput('regency')"
                      @keydown="onComboKeydown($event, 'regency')"
                      @blur="onComboBlur('regency')"
                    />
                    <span class="combo-chevron" aria-hidden="true">▾</span>

                    <div
                      v-if="activeCombo === 'regency'"
                      class="combo-sheet-backdrop"
                      @mousedown.self="closeCombo"
                    >
                      <div class="combo-dropdown" :class="{ 'is-mobile-sheet': isMobileViewport }">
                        <div v-if="isMobileViewport" class="sheet-header">
                          <strong>Pilih kota / kabupaten</strong>
                          <button type="button" class="sheet-close" @click="closeCombo">&times;</button>
                        </div>
                        <div v-if="isMobileViewport" class="sheet-search-bar">
                          <input
                            v-model="combFilter.regency"
                            type="text"
                            placeholder="Cari kota / kabupaten..."
                            autocomplete="off"
                          />
                        </div>
                        <ul id="listbox-regency" role="listbox" class="combo-options">
                          <li v-if="filteredRegencies.length === 0" class="combo-empty">
                            Tidak ditemukan. Periksa ejaan atau coba kata lain.
                          </li>
                          <li
                            v-for="(item, idx) in filteredRegencies"
                            :id="`opt-regency-${idx}`"
                            :key="item.code"
                            role="option"
                            :aria-selected="regencyCode === item.code"
                            class="combo-option"
                            :class="{ highlighted: idx === highlightedIndex, selected: regencyCode === item.code }"
                            @mousedown.prevent="selectComboOption('regency', item)"
                          >
                            {{ item.name }}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <span v-if="!provinceCode" id="hint-regency-disabled" class="field-hint">
                    Pilih provinsi terlebih dahulu
                  </span>
                  <span v-if="fieldErrors.regency_code" id="err-regency_code" class="field-error">
                    {{ fieldErrors.regency_code }}
                  </span>
                </div>

                <!-- Field 5: Kecamatan (Combobox) -->
                <div class="form-field">
                  <label for="field-district_code">Kecamatan <span class="req-tag">(wajib)</span></label>
                  <div class="combobox-container">
                    <input
                      id="field-district_code"
                      v-model="combText.district"
                      type="text"
                      role="combobox"
                      :aria-expanded="activeCombo === 'district'"
                      aria-controls="listbox-district"
                      :aria-activedescendant="activeCombo === 'district' && highlightedIndex >= 0 ? `opt-district-${highlightedIndex}` : undefined"
                      :aria-invalid="!!fieldErrors.district_code"
                      :aria-describedby="!regencyCode ? 'hint-district-disabled' : fieldErrors.district_code ? 'err-district_code' : undefined"
                      :placeholder="loadingLevel.district ? 'Memuat…' : 'Pilih kecamatan'"
                      :disabled="!regencyCode || loadingLevel.district"
                      autocomplete="off"
                      @focus="openCombo('district')"
                      @input="onComboInput('district')"
                      @keydown="onComboKeydown($event, 'district')"
                      @blur="onComboBlur('district')"
                    />
                    <span class="combo-chevron" aria-hidden="true">▾</span>

                    <div
                      v-if="activeCombo === 'district'"
                      class="combo-sheet-backdrop"
                      @mousedown.self="closeCombo"
                    >
                      <div class="combo-dropdown" :class="{ 'is-mobile-sheet': isMobileViewport }">
                        <div v-if="isMobileViewport" class="sheet-header">
                          <strong>Pilih kecamatan</strong>
                          <button type="button" class="sheet-close" @click="closeCombo">&times;</button>
                        </div>
                        <div v-if="isMobileViewport" class="sheet-search-bar">
                          <input
                            v-model="combFilter.district"
                            type="text"
                            placeholder="Cari kecamatan..."
                            autocomplete="off"
                          />
                        </div>
                        <ul id="listbox-district" role="listbox" class="combo-options">
                          <li v-if="filteredDistricts.length === 0" class="combo-empty">
                            Tidak ditemukan. Periksa ejaan atau coba kata lain.
                          </li>
                          <li
                            v-for="(item, idx) in filteredDistricts"
                            :id="`opt-district-${idx}`"
                            :key="item.code"
                            role="option"
                            :aria-selected="districtCode === item.code"
                            class="combo-option"
                            :class="{ highlighted: idx === highlightedIndex, selected: districtCode === item.code }"
                            @mousedown.prevent="selectComboOption('district', item)"
                          >
                            {{ item.name }}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <span v-if="!regencyCode" id="hint-district-disabled" class="field-hint">
                    Pilih kota atau kabupaten terlebih dahulu
                  </span>
                  <span v-if="fieldErrors.district_code" id="err-district_code" class="field-error">
                    {{ fieldErrors.district_code }}
                  </span>
                </div>

                <!-- Field 6: Kelurahan / Desa (Combobox, Opsional) -->
                <div class="form-field">
                  <label for="field-village_code">Kelurahan / Desa <span class="opt-tag">(opsional)</span></label>
                  <div class="combobox-container">
                    <input
                      id="field-village_code"
                      v-model="combText.village"
                      type="text"
                      role="combobox"
                      :aria-expanded="activeCombo === 'village'"
                      aria-controls="listbox-village"
                      :aria-activedescendant="activeCombo === 'village' && highlightedIndex >= 0 ? `opt-village-${highlightedIndex}` : undefined"
                      :aria-describedby="!districtCode ? 'hint-village-disabled' : undefined"
                      :placeholder="loadingLevel.village ? 'Memuat…' : 'Pilih kelurahan / desa (opsional)'"
                      :disabled="!districtCode || loadingLevel.village"
                      autocomplete="off"
                      @focus="openCombo('village')"
                      @input="onComboInput('village')"
                      @keydown="onComboKeydown($event, 'village')"
                      @blur="onComboBlur('village')"
                    />
                    <span class="combo-chevron" aria-hidden="true">▾</span>

                    <div
                      v-if="activeCombo === 'village'"
                      class="combo-sheet-backdrop"
                      @mousedown.self="closeCombo"
                    >
                      <div class="combo-dropdown" :class="{ 'is-mobile-sheet': isMobileViewport }">
                        <div v-if="isMobileViewport" class="sheet-header">
                          <strong>Pilih kelurahan / desa</strong>
                          <button type="button" class="sheet-close" @click="closeCombo">&times;</button>
                        </div>
                        <div v-if="isMobileViewport" class="sheet-search-bar">
                          <input
                            v-model="combFilter.village"
                            type="text"
                            placeholder="Cari kelurahan / desa..."
                            autocomplete="off"
                          />
                        </div>
                        <ul id="listbox-village" role="listbox" class="combo-options">
                          <li v-if="filteredVillages.length === 0" class="combo-empty">
                            Tidak ditemukan. Periksa ejaan atau coba kata lain.
                          </li>
                          <li
                            v-for="(item, idx) in filteredVillages"
                            :id="`opt-village-${idx}`"
                            :key="item.code"
                            role="option"
                            :aria-selected="villageCode === item.code"
                            class="combo-option"
                            :class="{ highlighted: idx === highlightedIndex, selected: villageCode === item.code }"
                            @mousedown.prevent="selectComboOption('village', item)"
                          >
                            <span>{{ item.name }}</span>
                            <span v-if="item.postal_code" class="opt-postal">{{ item.postal_code }}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <span v-if="!districtCode" id="hint-village-disabled" class="field-hint">
                    Pilih kecamatan terlebih dahulu
                  </span>
                </div>

                <!-- Field 7: Kode Pos -->
                <div class="form-field">
                  <label for="field-postal_code">Kode pos <span class="opt-tag">(opsional)</span></label>
                  <input
                    id="field-postal_code"
                    v-model="postalCode"
                    type="text"
                    inputmode="numeric"
                    autocomplete="postal-code"
                    maxlength="5"
                    placeholder="5 digit angka"
                    :aria-invalid="!!fieldErrors.postal_code"
                    :aria-describedby="fieldErrors.postal_code ? 'err-postal_code' : undefined"
                    @blur="validateField('postal_code')"
                  />
                  <span v-if="fieldErrors.postal_code" id="err-postal_code" class="field-error">
                    {{ fieldErrors.postal_code }}
                  </span>
                </div>

                <!-- Field 8: Alamat lengkap -->
                <div class="form-field full-span">
                  <label for="field-street">Alamat lengkap <span class="req-tag">(wajib)</span></label>
                  <textarea
                    id="field-street"
                    v-model="streetAddress"
                    rows="3"
                    autocomplete="street-address"
                    placeholder="Nama jalan, nomor, RT/RW, patokan (cth: depan warung X)"
                    :aria-invalid="!!fieldErrors.street"
                    :aria-describedby="fieldErrors.street ? 'err-street' : undefined"
                    @blur="validateField('street')"
                  ></textarea>
                  <span v-if="fieldErrors.street" id="err-street" class="field-error">
                    {{ fieldErrors.street }}
                  </span>
                </div>

                <!-- Field 9: Catatan untuk kurir -->
                <div class="form-field full-span">
                  <label for="field-courier_note">Catatan untuk kurir (opsional)</label>
                  <textarea
                    id="field-courier_note"
                    v-model="courierNote"
                    rows="2"
                    maxlength="200"
                    placeholder="Contoh: Titip di pos satpam jika rumah kosong (maks. 200 karakter)"
                  ></textarea>
                </div>

                <!-- Save Address Checkbox -->
                <div class="form-field full-span">
                  <label class="save-addr-checkbox">
                    <input v-model="saveAddressForNext" type="checkbox" />
                    <span>Simpan alamat ini untuk pesanan berikutnya</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. Daftar Barang yang Dipesan -->
          <div class="section-box">
            <div class="box-head-flex">
              <h3 class="box-title" style="margin-bottom: 0">Daftar Barang Pesanan</h3>
              <button
                v-if="!quoteId"
                type="button"
                class="btn-add-more"
                @click="showAddProductPicker = !showAddProductPicker"
              >
                {{ showAddProductPicker ? 'Tutup Katalog' : '+ Tambah Produk Lain' }}
              </button>
            </div>

            <div v-if="showAddProductPicker && !quoteId" class="add-product-drawer">
              <input
                v-model="pickerSearch"
                type="text"
                class="picker-search-input"
                placeholder="Cari produk ready stock atau jastip untuk ditambahkan..."
              />
              <div class="picker-scroll-list">
                <div
                  v-for="prod in availableToAdd"
                  :key="prod.id"
                  class="picker-prod-row"
                >
                  <img :src="prod.image" :alt="prod.name" class="picker-thumb" />
                  <div class="picker-info">
                    <span class="type-badge" :class="prod.productType">
                      {{ prod.productType === 'ready' ? 'Ready Stock' : `Jastip • ${prod.trip?.title || ''}` }}
                    </span>
                    <strong>{{ prod.name }}</strong>
                    <span>{{ formatRupiah(prod.price) }}</span>
                  </div>
                  <button type="button" class="btn-pick-add" @click="addProductToCheckout(prod)">
                    + Tambah
                  </button>
                </div>
              </div>
            </div>

            <div class="cart-items-list">
              <div v-for="(entry, idx) in checkoutItems" :key="entry.key" class="cart-item-card">
                <img v-if="entry.image" :src="entry.image" :alt="entry.name" class="cart-item-img" />
                <div class="cart-item-body">
                  <div class="cart-item-top">
                    <span class="type-badge" :class="entry.productType">
                      {{ entry.productType === 'ready' ? 'Ready Stock' : `Jastip${entry.tripTitle ? ' • ' + entry.tripTitle : ''}` }}
                    </span>
                    <button
                      v-if="checkoutItems.length > 1"
                      type="button"
                      class="btn-remove-item"
                      @click="removeCheckoutItem(idx)"
                    >
                      Hapus
                    </button>
                  </div>
                  <strong class="cart-item-title">{{ entry.name }}</strong>
                  <div class="cart-item-controls">
                    <div v-if="!quoteId" class="qty-control">
                      <button type="button" :disabled="entry.qty <= 1" @click="changeQty(idx, -1)">&minus;</button>
                      <span>{{ entry.qty }}</span>
                      <button type="button" :disabled="entry.qty >= entry.maxQty" @click="changeQty(idx, 1)">+</button>
                    </div>
                    <span v-else class="qty-fixed">{{ entry.qty }} pcs</span>

                    <select
                      v-if="!quoteId && entry.combinations && entry.combinations.length > 0"
                      v-model="entry.variant"
                      class="variant-input"
                      @change="onEntryVariantChange(entry)"
                    >
                      <option
                        v-for="comb in entry.combinations"
                        :key="comb.key"
                        :value="comb.label"
                        :disabled="comb.stock <= 0"
                      >
                        {{ comb.label }} — {{ formatRupiah(comb.price) }} (Sisa: {{ comb.stock }})
                      </option>
                    </select>
                    <input
                      v-else-if="!quoteId"
                      v-model="entry.variant"
                      type="text"
                      class="variant-input"
                      placeholder="Variasi / Ukuran (opsional)"
                    />
                    <strong class="cart-item-sub">{{ formatRupiah(entry.price * entry.qty) }}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="isSplitOrder" class="split-order-alert">
              ℹ️ <strong>Keranjang Campur Terdeteksi:</strong> Sistem akan otomatis memecah pesanan Anda menjadi
              <strong>{{ splitOrderGroupsCount }} nomor pesanan terpisah</strong> (Ready Stock &amp; Jastip per Trip) agar pengiriman lebih cepat.
            </div>
          </div>

          <!-- 3. Skema Pembayaran (Full vs DP 50% untuk Jastip) -->
          <div class="section-box">
            <h3 class="box-title">Skema Pembayaran</h3>
            <div class="payment-scheme-grid">
              <label class="radio-card" :class="{ selected: paymentType === 'full' }">
                <input v-model="paymentType" type="radio" value="full" />
                <div class="opt-text">
                  <strong>Pembayaran Penuh (100%)</strong>
                  <span>Bayar langsung sekali transfer setelah pesanan di-ACC admin.</span>
                </div>
              </label>

              <label
                class="radio-card"
                :class="{ selected: paymentType === 'dp', disabled: !hasJastipItem }"
              >
                <input v-model="paymentType" type="radio" value="dp" :disabled="!hasJastipItem" />
                <div class="opt-text">
                  <strong>DP 50% (Khusus Produk Jastip)</strong>
                  <span>
                    {{ hasJastipItem ? 'Bayar DP 50% di awal, pelunasan 50% saat barang tiba di Indonesia.' : 'Hanya tersedia untuk pesanan produk Jastip.' }}
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Right: Order Summary -->
        <div class="checkout-summary-col">
          <div class="summary-card">
            <h3 class="summary-title">Rincian Belanja</h3>

            <div class="summary-items">
              <div v-for="entry in checkoutItems" :key="entry.key" class="item-row">
                <div class="item-meta">
                  <span class="item-name">{{ entry.name }}</span>
                  <span class="item-qty-sub">
                    {{ entry.qty }} pcs &bull; {{ entry.variant || 'Standard' }} &bull;
                    {{ entry.productType === 'ready' ? 'Ready Stock' : 'Jastip' }}
                  </span>
                </div>
                <div class="item-price">{{ formatRupiah(entry.price * entry.qty) }}</div>
              </div>
            </div>

            <div class="subtotal-calc">
              <div class="calc-row">
                <span>Subtotal Barang</span>
                <span>{{ formatRupiah(subtotal) }}</span>
              </div>
              <div class="calc-row">
                <span>Ongkos Kirim</span>
                <span class="muted-val">Dikonfirmasi saat ACC Admin</span>
              </div>
              <div class="calc-row total-row">
                <span>Estimasi Total</span>
                <span class="total-price">{{ formatRupiah(subtotal) }}</span>
              </div>
              <div v-if="paymentType === 'dp' && hasJastipItem" class="dp-note-row">
                <span>Estimasi DP 50% Jastip</span>
                <strong class="dp-price">{{ formatRupiah(Math.ceil(jastipSubtotal / 2)) }}</strong>
              </div>
            </div>

            <div class="transfer-notice">
              <p>
                🔒 <strong>Rekening &amp; Instruksi Transfer Ditahan:</strong> Pembayaran baru dapat dilakukan setelah ketersediaan barang disetujui (di-ACC) oleh Admin dbb_luxe.
              </p>
            </div>

            <div class="sticky-submit-wrap">
              <button
                type="submit"
                class="btn-create-order"
                :disabled="isSubmitting || checkoutItems.length === 0"
              >
                {{ isSubmitting ? 'Memproses Pesanan…' : 'Lanjutkan' }}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'
import type { ApiProduct } from '../composables/useProducts'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const { currentUser } = useAuth()
const { showToast } = useToast()

const productId = route.query.productId as string
const quoteId = route.query.quoteId as string
const quoteProductName = route.query.productName as string
const quotePrice = route.query.price ? Number(route.query.price) : null
const quoteImage = route.query.image as string
const initialQty = Math.max(1, Number(route.query.qty) || 1)
const initialVariant = (route.query.variant as string) || 'Standard'

const { data: dbProducts } = await useFetch<ApiProduct[]>('/api/products', {
  query: { inStockOnly: 'true' }
})

interface CheckoutEntry {
  key: string
  productId: number
  name: string
  slug: string
  price: number
  image: string
  productType: 'ready' | 'jastip'
  tripId: number | null
  tripTitle: string | null
  qty: number
  maxQty: number
  maxQtyPerOrder: number
  variant: string
  combinations?: { key: string; label: string; price: number; stock: number }[]
}

const checkoutItems = ref<CheckoutEntry[]>([])

const resolveProductVariantInfo = (prod: ApiProduct, requestedVariant?: string) => {
  const combos = prod.variants?.combinations || []
  if (combos.length > 0) {
    const cleanReq = String(requestedVariant || '').trim().toLowerCase()
    const matched = combos.find(
      c => c.label.toLowerCase() === cleanReq || c.key.toLowerCase() === cleanReq
    ) || combos.find(c => c.stock > 0) || combos[0]

    const maxAllowed = Math.min(prod.maxQtyPerOrder || 10, Math.max(1, matched?.stock ?? 1))
    return {
      price: Number(matched?.price || prod.price),
      variant: matched?.label || 'Standard',
      maxQty: Math.max(1, maxAllowed),
      combinations: combos
    }
  }

  const maxAllowed = Math.min(
    prod.maxQtyPerOrder || 10,
    prod.productType === 'ready' ? (prod.stockQuantity ?? 10) : (prod.quota ?? 10)
  )
  return {
    price: Number(prod.price),
    variant: requestedVariant || 'Standard',
    maxQty: Math.max(1, maxAllowed),
    combinations: []
  }
}

const onEntryVariantChange = (entry: CheckoutEntry) => {
  if (!entry.combinations || entry.combinations.length === 0) return
  const matched = entry.combinations.find(c => c.label === entry.variant)
  if (matched) {
    entry.price = Number(matched.price)
    entry.maxQty = Math.max(1, Math.min(entry.maxQtyPerOrder || 10, matched.stock || 1))
    if (entry.qty > entry.maxQty) {
      entry.qty = entry.maxQty
    }
  }
}

const initCheckoutItems = () => {
  if (quoteId) {
    checkoutItems.value = [
      {
        key: `quote-${quoteId}`,
        productId: Number(quoteId),
        name: quoteProductName || 'Produk Request Khusus',
        slug: `request-${quoteId}`,
        price: quotePrice || 0,
        image: quoteImage || '',
        productType: 'jastip',
        tripId: null,
        tripTitle: 'Request Khusus',
        qty: initialQty,
        maxQty: 10,
        maxQtyPerOrder: 10,
        variant: 'Custom Request'
      }
    ]
    return
  }

  const list = dbProducts.value || []
  const found =
    list.find(p => String(p.id) === String(productId) || p.slug === String(productId)) || list[0]

  if (found) {
    const resolved = resolveProductVariantInfo(found, initialVariant)
    checkoutItems.value = [
      {
        key: `prod-${found.id}`,
        productId: Number(found.id),
        name: found.name,
        slug: found.slug,
        price: resolved.price,
        image: found.image,
        productType: found.productType,
        tripId: found.trip?.id || null,
        tripTitle: found.trip?.title || null,
        qty: Math.min(initialQty, resolved.maxQty),
        maxQty: resolved.maxQty,
        maxQtyPerOrder: found.maxQtyPerOrder || 10,
        variant: resolved.variant,
        combinations: resolved.combinations
      }
    ]
  }
}

initCheckoutItems()

const showAddProductPicker = ref(false)
const pickerSearch = ref('')

const availableToAdd = computed(() => {
  const list = dbProducts.value || []
  const q = pickerSearch.value.trim().toLowerCase()
  return list.filter(p => {
    if (p.inStock === false) return false
    if (q && !p.name.toLowerCase().includes(q) && !p.category?.toLowerCase().includes(q)) {
      return false
    }
    return true
  })
})

const addProductToCheckout = (prod: ApiProduct) => {
  const existing = checkoutItems.value.find(it => it.productId === Number(prod.id))
  if (existing) {
    if (existing.qty < existing.maxQty) {
      existing.qty += 1
      showToast('Jumlah Ditambah', `Qty ${prod.name} ditambah menjadi ${existing.qty} pcs.`, 'info')
    }
    return
  }

  const resolved = resolveProductVariantInfo(prod)

  checkoutItems.value.push({
    key: `prod-${prod.id}-${Date.now()}`,
    productId: Number(prod.id),
    name: prod.name,
    slug: prod.slug,
    price: resolved.price,
    image: prod.image,
    productType: prod.productType,
    tripId: prod.trip?.id || null,
    tripTitle: prod.trip?.title || null,
    qty: 1,
    maxQty: resolved.maxQty,
    maxQtyPerOrder: prod.maxQtyPerOrder || 10,
    variant: resolved.variant,
    combinations: resolved.combinations
  })
  showToast('Produk Ditambahkan', `${prod.name} masuk ke daftar checkout.`, 'success')
}

const removeCheckoutItem = (idx: number) => {
  checkoutItems.value.splice(idx, 1)
}

const changeQty = (idx: number, delta: number) => {
  const item = checkoutItems.value[idx]
  if (!item) return
  const next = item.qty + delta
  if (next >= 1 && next <= item.maxQty) {
    item.qty = next
  }
}

const hasJastipItem = computed(() => checkoutItems.value.some(it => it.productType === 'jastip'))

const splitOrderGroupsCount = computed(() => {
  const keys = new Set<string>()
  for (const it of checkoutItems.value) {
    keys.add(it.productType === 'ready' ? 'ready' : `jastip:${it.tripId ?? 0}`)
  }
  return keys.size
})

const isSplitOrder = computed(() => splitOrderGroupsCount.value > 1)

// ============================================================================
// Address Form State & Cascading Region Logic (design_address.md)
// ============================================================================
interface RegionOption {
  code: string
  name: string
  postal_code?: string | null
}

const savedAddresses = ref<any[]>([])
const selectedSavedId = ref<number | null>(null)
const useCustomAddress = ref(true)
const saveAddressForNext = ref(true)

const recipientName = ref(currentUser.value?.username || '')
const recipientPhone = ref(currentUser.value?.phone_number || '')
const provinceCode = ref('')
const regencyCode = ref('')
const districtCode = ref('')
const villageCode = ref('')
const postalCode = ref('')
const streetAddress = ref('')
const courierNote = ref('')

const provinces = ref<RegionOption[]>([])
const regencies = ref<RegionOption[]>([])
const districts = ref<RegionOption[]>([])
const villages = ref<RegionOption[]>([])

// In-memory session cache per level (design_address.md Section 3)
const regionCache = {
  provinces: null as RegionOption[] | null,
  regencies: new Map<string, RegionOption[]>(),
  districts: new Map<string, RegionOption[]>(),
  villages: new Map<string, RegionOption[]>()
}

const loadingLevel = reactive({
  province: false,
  regency: false,
  district: false,
  village: false
})

// Combobox text & filter state
type ComboLevel = 'province' | 'regency' | 'district' | 'village'
const activeCombo = ref<ComboLevel | null>(null)
const highlightedIndex = ref(0)
const isMobileViewport = ref(false)

const combText = reactive({
  province: '',
  regency: '',
  district: '',
  village: ''
})

const combFilter = reactive({
  province: '',
  regency: '',
  district: '',
  village: ''
})

const filteredProvinces = computed(() => {
  const q = combFilter.province.trim().toLowerCase()
  if (!q) return provinces.value
  return provinces.value.filter(p => p.name.toLowerCase().includes(q))
})

const filteredRegencies = computed(() => {
  const q = combFilter.regency.trim().toLowerCase()
  if (!q) return regencies.value
  return regencies.value.filter(r => r.name.toLowerCase().includes(q))
})

const filteredDistricts = computed(() => {
  const q = combFilter.district.trim().toLowerCase()
  if (!q) return districts.value
  return districts.value.filter(d => d.name.toLowerCase().includes(q))
})

const filteredVillages = computed(() => {
  const q = combFilter.village.trim().toLowerCase()
  if (!q) return villages.value
  return villages.value.filter(v => v.name.toLowerCase().includes(q))
})

const loadProvinces = async () => {
  if (regionCache.provinces) {
    provinces.value = regionCache.provinces
    return
  }
  loadingLevel.province = true
  try {
    const data = await $fetch<RegionOption[]>('/api/regions/provinces')
    regionCache.provinces = data || []
    provinces.value = regionCache.provinces
  } finally {
    loadingLevel.province = false
  }
}

const loadRegencies = async (provCode: string) => {
  if (!provCode) {
    regencies.value = []
    return
  }
  if (regionCache.regencies.has(provCode)) {
    regencies.value = regionCache.regencies.get(provCode)!
    return
  }
  loadingLevel.regency = true
  try {
    const data = await $fetch<RegionOption[]>('/api/regions/regencies', {
      query: { province: provCode }
    })
    regionCache.regencies.set(provCode, data || [])
    regencies.value = data || []
  } finally {
    loadingLevel.regency = false
  }
}

const loadDistricts = async (regCode: string) => {
  if (!regCode) {
    districts.value = []
    return
  }
  if (regionCache.districts.has(regCode)) {
    districts.value = regionCache.districts.get(regCode)!
    return
  }
  loadingLevel.district = true
  try {
    const data = await $fetch<RegionOption[]>('/api/regions/districts', {
      query: { regency: regCode }
    })
    regionCache.districts.set(regCode, data || [])
    districts.value = data || []
  } finally {
    loadingLevel.district = false
  }
}

const loadVillages = async (distCode: string) => {
  if (!distCode) {
    villages.value = []
    return
  }
  if (regionCache.villages.has(distCode)) {
    villages.value = regionCache.villages.get(distCode)!
    return
  }
  loadingLevel.village = true
  try {
    const data = await $fetch<RegionOption[]>('/api/regions/villages', {
      query: { district: distCode }
    })
    regionCache.villages.set(distCode, data || [])
    villages.value = data || []
  } finally {
    loadingLevel.village = false
  }
}

const openCombo = (level: ComboLevel) => {
  activeCombo.value = level
  combFilter[level] = ''
  highlightedIndex.value = 0
}

const closeCombo = () => {
  activeCombo.value = null
}

const onComboInput = (level: ComboLevel) => {
  activeCombo.value = level
  combFilter[level] = combText[level]
  highlightedIndex.value = 0
}

const getActiveOptions = (level: ComboLevel): RegionOption[] => {
  if (level === 'province') return filteredProvinces.value
  if (level === 'regency') return filteredRegencies.value
  if (level === 'district') return filteredDistricts.value
  return filteredVillages.value
}

const selectComboOption = async (level: ComboLevel, item: RegionOption) => {
  if (level === 'province') {
    const changed = provinceCode.value !== item.code
    provinceCode.value = item.code
    combText.province = item.name
    combFilter.province = ''
    fieldErrors.province_code = ''
    activeCombo.value = null
    if (changed) {
      // Reset children below province
      regencyCode.value = ''
      combText.regency = ''
      districtCode.value = ''
      combText.district = ''
      villageCode.value = ''
      combText.village = ''
      postalCode.value = ''
      districts.value = []
      villages.value = []
      await loadRegencies(item.code)
    }
  } else if (level === 'regency') {
    const changed = regencyCode.value !== item.code
    regencyCode.value = item.code
    combText.regency = item.name
    combFilter.regency = ''
    fieldErrors.regency_code = ''
    activeCombo.value = null
    if (changed) {
      // Reset children below regency
      districtCode.value = ''
      combText.district = ''
      villageCode.value = ''
      combText.village = ''
      postalCode.value = ''
      villages.value = []
      await loadDistricts(item.code)
    }
  } else if (level === 'district') {
    const changed = districtCode.value !== item.code
    districtCode.value = item.code
    combText.district = item.name
    combFilter.district = ''
    fieldErrors.district_code = ''
    activeCombo.value = null
    if (changed) {
      // Reset children below district
      villageCode.value = ''
      combText.village = ''
      postalCode.value = ''
      await loadVillages(item.code)
    }
  } else if (level === 'village') {
    villageCode.value = item.code
    combText.village = item.name
    combFilter.village = ''
    activeCombo.value = null
    // Prefill postal code from kelurahan when available (remains editable)
    if (item.postal_code) {
      postalCode.value = item.postal_code
      fieldErrors.postal_code = ''
    }
  }
}

const onComboKeydown = (e: KeyboardEvent, level: ComboLevel) => {
  const opts = getActiveOptions(level)
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (activeCombo.value !== level) openCombo(level)
    else if (opts.length > 0) highlightedIndex.value = (highlightedIndex.value + 1) % opts.length
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (activeCombo.value !== level) openCombo(level)
    else if (opts.length > 0) highlightedIndex.value = (highlightedIndex.value - 1 + opts.length) % opts.length
  } else if (e.key === 'Enter') {
    if (activeCombo.value === level && opts[highlightedIndex.value]) {
      e.preventDefault()
      selectComboOption(level, opts[highlightedIndex.value])
    }
  } else if (e.key === 'Escape') {
    closeCombo()
  } else if (e.key === 'Tab') {
    closeCombo()
  }
}

const onComboBlur = (level: ComboLevel) => {
  setTimeout(() => {
    if (activeCombo.value === level && !isMobileViewport.value) {
      activeCombo.value = null
    }
    // Restore selected label if user typed partial text without choosing
    if (level === 'province') {
      const found = provinces.value.find(p => p.code === provinceCode.value)
      combText.province = found ? found.name : ''
      validateField('province_code')
    } else if (level === 'regency') {
      const found = regencies.value.find(r => r.code === regencyCode.value)
      combText.regency = found ? found.name : ''
      validateField('regency_code')
    } else if (level === 'district') {
      const found = districts.value.find(d => d.code === districtCode.value)
      combText.district = found ? found.name : ''
      validateField('district_code')
    } else if (level === 'village') {
      const found = villages.value.find(v => v.code === villageCode.value)
      combText.village = found ? found.name : ''
    }
  }, 180)
}

// Single search box ("Cari kecamatan atau kelurahan")
const quickSearchQuery = ref('')
const quickSearchResults = ref<any[]>([])
const quickSearchLoading = ref(false)
const quickSearchOpen = ref(false)
let quickSearchTimer: ReturnType<typeof setTimeout> | null = null

const handleQuickSearchInput = () => {
  if (quickSearchTimer) clearTimeout(quickSearchTimer)
  const q = quickSearchQuery.value.trim()
  if (q.length < 3) {
    quickSearchResults.value = []
    quickSearchOpen.value = false
    return
  }
  quickSearchTimer = setTimeout(async () => {
    quickSearchLoading.value = true
    try {
      const res = await $fetch<any[]>('/api/regions/search', { query: { q } })
      quickSearchResults.value = res || []
      quickSearchOpen.value = quickSearchResults.value.length > 0
    } catch {
      quickSearchResults.value = []
    } finally {
      quickSearchLoading.value = false
    }
  }, 220)
}

const applyQuickSearchResult = async (item: any) => {
  quickSearchOpen.value = false
  quickSearchQuery.value = item.label

  provinceCode.value = item.province_code
  combText.province = item.province_name
  fieldErrors.province_code = ''

  await loadRegencies(item.province_code)
  regencyCode.value = item.regency_code
  combText.regency = item.regency_name
  fieldErrors.regency_code = ''

  await loadDistricts(item.regency_code)
  districtCode.value = item.district_code
  combText.district = item.district_name
  fieldErrors.district_code = ''

  await loadVillages(item.district_code)
  if (item.village_code) {
    villageCode.value = item.village_code
    combText.village = item.village_name || ''
  } else {
    villageCode.value = ''
    combText.village = ''
  }

  if (item.postal_code) {
    postalCode.value = item.postal_code
    fieldErrors.postal_code = ''
  }
}

// Saved addresses loading & selection
const selectSavedAddress = async (addr: any) => {
  if (!addr) return
  selectedSavedId.value = addr.id
  useCustomAddress.value = false

  recipientName.value = addr.recipient_name
  recipientPhone.value = addr.phone
  provinceCode.value = addr.province_code
  combText.province = addr.province_name

  await loadRegencies(addr.province_code)
  regencyCode.value = addr.regency_code
  combText.regency = addr.regency_name

  await loadDistricts(addr.regency_code)
  districtCode.value = addr.district_code
  combText.district = addr.district_name

  await loadVillages(addr.district_code)
  villageCode.value = addr.village_code || ''
  combText.village = addr.village_name || ''
  postalCode.value = addr.postal_code || ''
  streetAddress.value = addr.street || ''
  courierNote.value = addr.courier_note || ''

  // Clear errors
  Object.keys(fieldErrors).forEach(k => (fieldErrors[k] = ''))
}

const switchToCustomAddress = () => {
  useCustomAddress.value = true
  selectedSavedId.value = null
  provinceCode.value = ''
  combText.province = ''
  regencyCode.value = ''
  combText.regency = ''
  districtCode.value = ''
  combText.district = ''
  villageCode.value = ''
  combText.village = ''
  postalCode.value = ''
  streetAddress.value = ''
  courierNote.value = ''
  quickSearchQuery.value = ''
}

// ============================================================================
// Validation (design_address.md Section 4)
// ============================================================================
const fieldErrors = reactive<Record<string, string>>({
  recipient_name: '',
  phone: '',
  province_code: '',
  regency_code: '',
  district_code: '',
  postal_code: '',
  street: ''
})

const errorSummaryRef = ref<HTMLElement | null>(null)

const normalizePhoneClient = (raw: string): string | null => {
  const cleaned = String(raw || '').replace(/[\s\-().]/g, '')
  if (!/^(\+62|62|0)8[1-9][0-9]{6,11}$/.test(cleaned)) {
    return null
  }
  if (cleaned.startsWith('+62')) return cleaned.slice(1)
  if (cleaned.startsWith('0')) return '62' + cleaned.slice(1)
  return cleaned
}

const handlePhoneBlur = () => {
  const norm = normalizePhoneClient(recipientPhone.value)
  if (norm) {
    recipientPhone.value = norm
    fieldErrors.phone = ''
  } else {
    fieldErrors.phone = 'Masukkan nomor HP yang valid, contoh: 081234567890'
  }
}

const validateField = (field: string): boolean => {
  if (field === 'recipient_name') {
    const val = recipientName.value.trim()
    fieldErrors.recipient_name = val.length < 2 ? 'Nama penerima wajib diisi' : ''
    return !fieldErrors.recipient_name
  }
  if (field === 'phone') {
    const norm = normalizePhoneClient(recipientPhone.value)
    if (norm) {
      recipientPhone.value = norm
      fieldErrors.phone = ''
      return true
    }
    fieldErrors.phone = 'Masukkan nomor HP yang valid, contoh: 081234567890'
    return false
  }
  if (field === 'province_code') {
    fieldErrors.province_code = !provinceCode.value ? 'Pilih provinsi terlebih dahulu' : ''
    return !fieldErrors.province_code
  }
  if (field === 'regency_code') {
    fieldErrors.regency_code = !regencyCode.value ? 'Pilih kota atau kabupaten' : ''
    return !fieldErrors.regency_code
  }
  if (field === 'district_code') {
    fieldErrors.district_code = !districtCode.value ? 'Pilih kecamatan' : ''
    return !fieldErrors.district_code
  }
  if (field === 'postal_code') {
    const val = postalCode.value.trim()
    fieldErrors.postal_code = val && !/^\d{5}$/.test(val) ? 'Kode pos harus 5 angka' : ''
    return !fieldErrors.postal_code
  }
  if (field === 'street') {
    const val = streetAddress.value.trim()
    fieldErrors.street = val.length < 10 ? 'Tulis alamat lengkap (nama jalan, nomor, RT/RW)' : ''
    return !fieldErrors.street
  }
  return true
}

const validateAllAddressFields = (): boolean => {
  const order = ['recipient_name', 'phone', 'province_code', 'regency_code', 'district_code', 'postal_code', 'street']
  let allValid = true
  for (const f of order) {
    const ok = validateField(f)
    if (!ok) allValid = false
  }
  return allValid
}

const errorSummaryList = computed(() => {
  const list: { field: string; message: string }[] = []
  const order = ['recipient_name', 'phone', 'province_code', 'regency_code', 'district_code', 'postal_code', 'street']
  for (const f of order) {
    if (fieldErrors[f]) {
      list.push({ field: f, message: fieldErrors[f] })
    }
  }
  return list
})

const focusField = (field: string) => {
  const el = document.getElementById(`field-${field}`)
  if (el) {
    el.focus()
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

const checkViewport = () => {
  if (typeof window !== 'undefined') {
    isMobileViewport.value = window.innerWidth <= 600
  }
}

onMounted(async () => {
  checkViewport()
  window.addEventListener('resize', checkViewport)
  await loadProvinces()

  try {
    const saved = await $fetch<any[]>('/api/addresses')
    if (Array.isArray(saved) && saved.length > 0) {
      savedAddresses.value = saved
      const preselected = saved.find(a => a.is_default) || saved[0]
      await selectSavedAddress(preselected)
    }
  } catch {
    // Guest or no saved addresses yet
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', checkViewport)
  }
})

// ============================================================================
// Payment & Order Submission
// ============================================================================
const paymentType = ref<'full' | 'dp'>('full')
const isSubmitting = ref(false)

watch(hasJastipItem, (has) => {
  if (!has && paymentType.value === 'dp') {
    paymentType.value = 'full'
  }
})

const subtotal = computed(() =>
  checkoutItems.value.reduce((sum, it) => sum + it.price * it.qty, 0)
)

const jastipSubtotal = computed(() =>
  checkoutItems.value
    .filter(it => it.productType === 'jastip')
    .reduce((sum, it) => sum + it.price * it.qty, 0)
)

const handleCreateOrder = async () => {
  if (!validateAllAddressFields()) {
    useCustomAddress.value = true
    await nextTick()
    const firstInvalid = errorSummaryList.value[0]?.field
    if (firstInvalid) {
      focusField(firstInvalid)
    } else {
      errorSummaryRef.value?.focus()
    }
    return
  }

  isSubmitting.value = true
  try {
    const res = await $fetch<{
      success: boolean
      orders: any[]
      primaryOrder: any
    }>('/api/orders', {
      method: 'POST',
      body: {
        fulfillmentMethod: 'delivery',
        recipientName: recipientName.value.trim(),
        recipientPhone: recipientPhone.value.trim(),
        provinceCode: provinceCode.value,
        regencyCode: regencyCode.value,
        districtCode: districtCode.value,
        villageCode: villageCode.value || null,
        postalCode: postalCode.value.trim() || null,
        street: streetAddress.value.trim(),
        courierNote: courierNote.value.trim() || null,
        saveAddress: useCustomAddress.value && saveAddressForNext.value,
        paymentType: hasJastipItem.value ? paymentType.value : 'full',
        quoteId: quoteId ? Number(quoteId) : null,
        qty: checkoutItems.value[0]?.qty || 1,
        items: checkoutItems.value.map(it => ({
          productId: it.productId,
          qty: it.qty,
          variant: it.variant || 'Standard'
        }))
      }
    })

    if (res.orders && res.orders.length > 1) {
      const codes = res.orders.map(o => `#${o.orderCode}`).join(', ')
      showToast(
        'Keranjang Campur Dipecah Otomatis!',
        `Berhasil membuat ${res.orders.length} pesanan (${codes}). Menunggu ACC Admin.`,
        'success'
      )
      await router.push('/orders')
    } else if (res.primaryOrder) {
      showToast(
        'Pesanan Berhasil Diajukan!',
        `Kode pesanan #${res.primaryOrder.orderCode}. Menunggu persetujuan (ACC) dari Admin dbb_luxe.`,
        'success'
      )
      await router.push(`/orders/${res.primaryOrder.orderCode}`)
    }
  } catch (err: any) {
    const serverErrors = err?.data?.data?.errors
    if (serverErrors && typeof serverErrors === 'object') {
      Object.assign(fieldErrors, serverErrors)
      useCustomAddress.value = true
      await nextTick()
      const firstKey = Object.keys(serverErrors)[0]
      if (firstKey) focusField(firstKey)
    }
    showToast(
      'Gagal Membuat Pesanan',
      err?.data?.message || 'Terjadi kesalahan saat mengajukan pesanan.',
      'warning'
    )
  } finally {
    isSubmitting.value = false
  }
}

const formatRupiah = (val: number) => {
  return 'Rp ' + Number(val || 0).toLocaleString('id-ID')
}
</script>

<style scoped>
.checkout-page {
  padding: 30px 20px 80px;
}

.page-container {
  max-width: 1140px;
  margin: 0 auto;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--color-text-muted, #7A6A55);
  margin-bottom: 20px;
}

.breadcrumb a {
  text-decoration: none;
  color: inherit;
}

.breadcrumb .active {
  color: var(--color-primary, #8C6D3F);
  font-weight: 700;
}

.page-header {
  margin-bottom: 28px;
}

.page-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
  margin-bottom: 6px;
}

.page-subtitle {
  font-size: 0.92rem;
  color: var(--color-text-muted, #7A6A55);
}

.checkout-layout {
  display: grid;
  grid-template-columns: 1.45fr 1fr;
  gap: 32px;
  align-items: start;
}

.section-box {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
}

.box-head-flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.box-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
  margin-bottom: 16px;
}

/* Error Summary (role="alert") */
.error-summary-box {
  background: #FEF2F2;
  border: 2px solid #DC2626;
  color: #991B1B;
  border-radius: 10px;
  padding: 16px 20px;
  margin-bottom: 20px;
}

.error-summary-box strong {
  display: block;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.error-summary-box ul {
  margin: 0;
  padding-left: 20px;
}

.error-summary-box li {
  margin-bottom: 4px;
}

.error-summary-box a {
  color: #991B1B;
  font-weight: 700;
  text-decoration: underline;
}

/* Saved Addresses */
.saved-addresses-section {
  margin-bottom: 18px;
}

.saved-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.saved-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: #2B2116;
}

.btn-use-other-addr {
  background: none;
  border: 1.5px solid #8C6D3F;
  color: #8C6D3F;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}

.saved-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.saved-addr-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border: 1.5px solid #C8B89A;
  border-radius: 10px;
  cursor: pointer;
  background: #ffffff;
}

.saved-addr-card.selected {
  border-color: #8C6D3F;
  background: #FFFBF2;
}

.saved-addr-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.86rem;
}

.saved-addr-top {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.default-pill {
  background: #EFE1C6;
  color: #5C4322;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
}

.saved-addr-street {
  margin: 0;
  color: #2B2116;
}

.saved-addr-region {
  color: #5C4E3C;
  font-size: 0.8rem;
}

.saved-addr-note {
  color: #6F5530;
  font-size: 0.78rem;
  font-style: italic;
}

/* Address Form Grid (design_address.md Section 5 & 8) */
.address-fields-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field.full-span {
  grid-column: 1 / -1;
}

.form-field label {
  font-size: 0.92rem;
  font-weight: 700;
  color: #221A11;
}

.req-tag {
  font-size: 0.8rem;
  font-weight: 600;
  color: #8C6D3F;
}

.opt-tag {
  font-size: 0.8rem;
  font-weight: 500;
  color: #6B5B47;
}

/* Inputs at least 48px tall, font at least 16px (1rem) so iOS doesn't zoom on focus */
.form-field input[type="text"],
.form-field input[type="tel"],
.form-field textarea {
  min-height: 48px;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1.5px solid #9E8C72;
  font-size: 1rem;
  color: #221A11;
  background: #ffffff;
  width: 100%;
  font-family: inherit;
  box-sizing: border-box;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.form-field input:focus,
.form-field textarea:focus {
  outline: none;
  border-color: #8C6D3F;
  box-shadow: 0 0 0 3px rgba(140, 109, 63, 0.28);
}

.form-field input[aria-invalid="true"],
.form-field textarea[aria-invalid="true"] {
  border-color: #DC2626;
}

.form-field input:disabled {
  background: #F5F2EB;
  color: #6E6252;
  cursor: not-allowed;
}

.field-hint {
  font-size: 0.8rem;
  color: #5C4E3C;
}

.field-error {
  font-size: 0.84rem;
  font-weight: 700;
  color: #B91C1C;
}

/* Quick Combined Search Box */
.quick-search-box {
  position: relative;
}

.quick-loading {
  position: absolute;
  right: 14px;
  top: 14px;
  font-size: 0.82rem;
  color: #6B5B47;
}

.quick-results-list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 40;
  background: #ffffff;
  border: 1.5px solid #8C6D3F;
  border-radius: 10px;
  max-height: 260px;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: 6px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.14);
}

.quick-result-item {
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.quick-result-item:hover {
  background: #FFFBF2;
}

.quick-postal {
  font-size: 0.78rem;
  color: #6B5B47;
  background: #EFE1C6;
  padding: 2px 6px;
  border-radius: 4px;
}

/* Combobox & Mobile Bottom Sheet */
.combobox-container {
  position: relative;
}

.combo-chevron {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #5C4E3C;
  font-size: 0.9rem;
}

.combo-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 50;
  background: #ffffff;
  border: 1.5px solid #8C6D3F;
  border-radius: 10px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.14);
  overflow: hidden;
}

.combo-options {
  list-style: none;
  margin: 0;
  padding: 6px;
  max-height: 240px;
  overflow-y: auto;
}

.combo-option {
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  color: #221A11;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.combo-option.highlighted,
.combo-option:hover {
  background: #FFFBF2;
}

.combo-option.selected {
  font-weight: 700;
  background: #EFE1C6;
}

.combo-empty {
  padding: 14px 12px;
  font-size: 0.88rem;
  color: #6B5B47;
  text-align: center;
}

.opt-postal {
  font-size: 0.78rem;
  color: #5C4E3C;
}

.save-addr-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 0.92rem;
  font-weight: 600;
  color: #221A11;
}

.save-addr-checkbox input {
  width: 20px;
  height: 20px;
  accent-color: #8C6D3F;
}

/* Cart Items & Payment Scheme */
.btn-add-more {
  background: #FFFBF2;
  border: 1px solid var(--color-primary, #8C6D3F);
  color: var(--color-primary, #8C6D3F);
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
}

.add-product-drawer {
  background: #FFFDF8;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 16px;
}

.picker-search-input {
  width: 100%;
  min-height: 44px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-secondary, #EFE1C6);
  font-size: 0.95rem;
  margin-bottom: 10px;
  box-sizing: border-box;
}

.picker-scroll-list {
  max-height: 220px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.picker-prod-row {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  padding: 8px 10px;
  border-radius: 8px;
}

.picker-thumb {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
}

.picker-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  font-size: 0.78rem;
}

.btn-pick-add {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
}

.cart-items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cart-item-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 10px;
  background: #FFFDF9;
}

.cart-item-img {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.cart-item-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cart-item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.type-badge {
  font-size: 0.68rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 999px;
  align-self: flex-start;
}

.type-badge.ready {
  background: #DCFCE7;
  color: #166534;
}

.type-badge.jastip {
  background: #2a1d14;
  color: #e3c58f;
}

.btn-remove-item {
  background: none;
  border: none;
  color: #B91C1C;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

.cart-item-title {
  font-size: 0.9rem;
  color: var(--color-text, #2B2116);
}

.cart-item-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.qty-control {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 6px;
  background: #ffffff;
}

.qty-control button {
  background: none;
  border: none;
  width: 28px;
  height: 28px;
  font-weight: 700;
  cursor: pointer;
}

.qty-control span {
  padding: 0 10px;
  font-size: 0.84rem;
  font-weight: 700;
}

.variant-input {
  flex: 1;
  min-width: 120px;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--color-secondary, #EFE1C6);
  font-size: 0.88rem;
}

.cart-item-sub {
  font-size: 0.88rem;
  color: var(--color-primary, #8C6D3F);
}

.split-order-alert {
  margin-top: 14px;
  padding: 10px 14px;
  border-radius: 8px;
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  color: #1E40AF;
  font-size: 0.8rem;
  line-height: 1.45;
}

.payment-scheme-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.radio-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 10px;
  cursor: pointer;
}

.radio-card.selected {
  border-color: var(--color-primary, #8C6D3F);
  background: var(--color-canvas, #FFFBF2);
}

.radio-card.disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.opt-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.opt-text strong {
  font-size: 0.86rem;
  color: var(--color-text, #2B2116);
}

.opt-text span {
  font-size: 0.76rem;
  color: var(--color-text-muted, #7A6A55);
}

.summary-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 12px;
  padding: 22px;
  position: sticky;
  top: 90px;
}

.summary-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
  margin-bottom: 16px;
}

.summary-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--color-secondary, #EFE1C6);
  margin-bottom: 14px;
}

.item-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.item-meta {
  display: flex;
  flex-direction: column;
}

.item-name {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--color-text, #2B2116);
}

.item-qty-sub {
  font-size: 0.74rem;
  color: var(--color-text-muted, #7A6A55);
}

.item-price {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--color-text, #2B2116);
}

.subtotal-calc {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.calc-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--color-text-muted, #7A6A55);
}

.muted-val {
  font-size: 0.78rem;
  font-style: italic;
}

.total-row {
  padding-top: 10px;
  border-top: 1px dashed var(--color-secondary, #EFE1C6);
  font-weight: 800;
  font-size: 1rem;
  color: var(--color-text, #2B2116);
}

.total-price {
  color: var(--color-primary, #8C6D3F);
}

.dp-note-row {
  background: #FFFBEB;
  border: 1px solid #FDE68A;
  padding: 8px 12px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  color: #92400E;
}

.transfer-notice {
  background: #FFFDF8;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 0.78rem;
  color: var(--color-text-muted, #7A6A55);
  margin-bottom: 16px;
  line-height: 1.45;
}

.btn-create-order {
  width: 100%;
  min-height: 48px;
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 14px;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
}

.btn-create-order:hover:not(:disabled) {
  background: var(--color-primary-hover, #6F5530);
}

.btn-create-order:focus-visible {
  outline: 3px solid #221A11;
  outline-offset: 2px;
}

.btn-create-order:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Layout & Responsiveness (design_address.md Section 5) */
@media (max-width: 1023px) {
  .checkout-layout {
    grid-template-columns: 1fr;
    max-width: 560px;
    margin: 0 auto;
  }

  .address-fields-grid,
  .payment-scheme-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .checkout-page {
    padding: 20px 12px 100px;
  }

  .section-box {
    padding: 16px;
  }

  /* Bottom sheet on phones <= 600px */
  .combo-sheet-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.48);
    z-index: 1200;
    display: flex;
    align-items: flex-end;
  }

  .combo-dropdown.is-mobile-sheet {
    position: relative;
    top: auto;
    width: 100%;
    max-height: 75dvh;
    border-radius: 18px 18px 0 0;
    border: none;
    display: flex;
    flex-direction: column;
    padding-bottom: env(safe-area-inset-bottom, 12px);
    animation: sheetSlideUp 0.22s ease-out;
  }

  .sheet-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 16px;
    border-bottom: 1px solid #EFE1C6;
  }

  .sheet-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    line-height: 1;
    cursor: pointer;
    color: #221A11;
  }

  .sheet-search-bar {
    padding: 10px 16px;
    border-bottom: 1px solid #EFE1C6;
  }

  .sheet-search-bar input {
    width: 100%;
    min-height: 48px;
    padding: 10px 12px;
    border: 1.5px solid #9E8C72;
    border-radius: 8px;
    font-size: 1rem;
    box-sizing: border-box;
  }

  .combo-dropdown.is-mobile-sheet .combo-options {
    max-height: 55dvh;
    padding: 8px 12px;
  }

  .sticky-submit-wrap {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    background: #ffffff;
    border-top: 1px solid #EFE1C6;
    padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px));
    z-index: 900;
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
  }
}

@media (prefers-reduced-motion: reduce) {
  .combo-dropdown.is-mobile-sheet {
    animation: none !important;
  }
}

@keyframes sheetSlideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
